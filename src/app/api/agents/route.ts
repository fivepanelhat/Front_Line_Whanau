import { NextRequest } from 'next/server';
import { agentGraph } from '@/ai/graph';
import { telemetryHandler } from '@/ai/telemetry';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { routeLogger } from '@/lib/logger';
import { aiCircuitBreaker } from '@/lib/circuit-breaker';
import * as Sentry from '@sentry/nextjs';

const log = routeLogger('/api/agents');
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/ai/security';
import { AgentQuerySchema } from '@/lib/validations';



type ChatHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function isChatHistoryMessage(value: unknown): value is ChatHistoryMessage {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === 'user' || candidate.role === 'assistant') &&
    typeof candidate.content === 'string'
  );
}

export async function POST(request: NextRequest) {
  // 1. IP-based Rate Limiting (10 requests per minute)
  const ip = request.headers.get('x-forwarded-for') || 'unknown_ip';
  const isAllowed = await checkRateLimit(ip, 10, 60000);
  if (!isAllowed) {
    log.warn({ ip }, 'Rate limit exceeded');
    return new Response(JSON.stringify({ error: 'Too Many Requests' }), { status: 429 });
  }

  try {
    const rawBody = await request.json();
    const parsed = AgentQuerySchema.safeParse(rawBody);
    
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid Input', details: parsed.error }), { status: 400 });
    }

    const { 
      query, 
      consentGiven = true, 
      threadId = `thread_${Date.now()}`,
      history = []
    } = parsed.data;

    // Convert history into LangChain messages, limiting to the last 10 to save tokens
    const safeHistory = (Array.isArray(history) ? history.filter(isChatHistoryMessage) : []).slice(-10);

    const previousMessages = safeHistory.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    // 2. AbortController Timeout (30 seconds)
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 30000);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const startTime = Date.now();

        try {
          const runGraph = async () => {
            return await agentGraph.streamEvents(
              {
                query,
                consentGiven,
                messages: [...previousMessages, new HumanMessage(query)],
              },
              {
                version: 'v2',
                configurable: { thread_id: threadId },
                signal: abortController.signal,
                callbacks: [telemetryHandler],
              }
            );
          };

          const eventStream = await aiCircuitBreaker.fire(runGraph).catch((cbError: any) => {
            if (cbError.message && cbError.message.includes('OPEN')) {
              throw new Error('CIRCUIT_OPEN');
            }
            throw cbError;
          });

          // Model events from nested react-agent subgraphs arrive duplicated:
          // the inheritable stream handler gets re-merged at each subgraph
          // nesting level, so one model run emits N identical copies of every
          // start/chunk (same run_id, copies strictly consecutive). Track the
          // start count per run and forward every Nth chunk once.
          const runStartCounts = new Map<string, number>();
          const runChunkCounts = new Map<string, number>();
          let finalState: Record<string, any> | null = null;

          for await (const event of eventStream) {
            // The graph also runs several sequential model calls (intent
            // classifier, then the agent). Reset the client's buffer at each
            // new run so only the final call's answer remains — otherwise
            // responses arrive prefixed with classifier labels.
            if (event.event === 'on_chat_model_start') {
              const runId = String(event.run_id);
              const starts = (runStartCounts.get(runId) || 0) + 1;
              runStartCounts.set(runId, starts);
              if (starts === 1) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'reset' })}\n\n`)
                );
              }
            }

            if (event.event === 'on_chat_model_stream') {
              const content = event.data?.chunk?.content;
              if (content) {
                const runId = String(event.run_id);
                const dupFactor = runStartCounts.get(runId) || 1;
                const seen = runChunkCounts.get(runId) || 0;
                runChunkCounts.set(runId, seen + 1);
                if (seen % dupFactor === 0) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'token', content })}\n\n`)
                  );
                }
              }
            }

            // Track the latest graph state seen on any chain end. The old
            // check (event.name === 'agentGraph') matched nothing — the
            // compiled graph streams under the name 'LangGraph' — so the
            // 'final' event (agent name, review flag, sources) never reached
            // the client. The root chain's end is the last one with state.
            if (event.event === 'on_chain_end') {
              const output = event.data?.output;
              if (output && typeof output === 'object' && ('finalResponse' in output || 'currentAgent' in output)) {
                finalState = { ...(finalState || {}), ...(output as Record<string, any>) };
              }
            }
          }

          if (finalState) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'final',
                  agent: finalState.currentAgent,
                  requiresHumanReview: finalState.requiresHumanReview,
                  showUrgentHelp: finalState.showUrgentHelp,
                  sources: finalState.sources,
                  // Fallback for nodes that produce a response without
                  // streaming model tokens (canned/guardrail responses):
                  // the client uses this when the streamed text is empty.
                  finalResponse: finalState.finalResponse,
                })}\n\n`
              )
            );

            const durationMs = Date.now() - startTime;
            const agentForMetrics = finalState.currentAgent;
            createClient().then(supabase => {
              supabase.from('analytics_events').insert({
                event_type: 'agent_latency',
                path: '/api/agents',
                session_hash: threadId,
                metadata: { agent: agentForMetrics, durationMs }
              }).then(() => {});
            });
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error: any) {
          // Handle LangGraph Interrupt
          if (error && (error.name === 'Interrupt' || error.name === 'GraphInterrupt')) {
            // Extract the proposed response from the interrupt value
            const interruptValue = error.value || error.interrupt || {};
            const proposedResponse = interruptValue.proposedResponse || '';

            // Insert pending review into Supabase
            try {
              const supabase = await createClient();
              await supabase.from('ai_reviews').insert({
                thread_id: threadId,
                query: query,
                proposed_response: proposedResponse,
                status: 'pending',
              });
            } catch (dbErr) {
              log.error({ err: dbErr, threadId }, 'Failed to save ai_review');
            }
            
            log.info({ threadId }, 'LangGraph interrupted for Human-in-the-Loop review');
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'interrupt',
                  message: 'This response requires human review before being sent.',
                  threadId,
                  requiresHumanReview: true,
                  proposedResponse,
                })}\n\n`
              )
            );
          } else if (error.name === 'AbortError') {
            log.error({ threadId }, 'Agent execution timed out after 30 seconds');
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                content: 'The request timed out. Please try again.' 
              })}\n\n`)
            );
          } else if (error.message === 'CIRCUIT_OPEN') {
            log.error({ threadId }, 'Circuit Breaker Open - System under high load');
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                content: 'The system is experiencing high volume. Please try again later.' 
              })}\n\n`)
            );
          } else {
            // Generic error
            log.error({ err: error, threadId }, 'Streaming error');
            Sentry.captureException(error, {
              tags: { component: 'agent_graph', threadId }
            });
            createClient().then(supabase => {
              supabase.from('analytics_events').insert({
                event_type: 'agent_error',
                path: '/api/agents',
                session_hash: threadId,
                metadata: { error: error.message || 'Generic error' }
              }).then(() => {});
            });
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'error', 
                content: 'An error occurred during streaming.' 
              })}\n\n`)
            );
          }
        } finally {
          clearTimeout(timeoutId);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });

  } catch (error) {
    log.error({ err: error }, 'API error');
    Sentry.captureException(error, { tags: { route: '/api/agents' } });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
