import { NextRequest } from 'next/server';
import { agentGraph } from '@/ai/graph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { routeLogger } from '@/lib/logger';
import { aiCircuitBreaker } from '@/lib/circuit-breaker';

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
                signal: abortController.signal
              }
            );
          };

          const eventStream = await aiCircuitBreaker.fire(runGraph).catch((cbError: any) => {
            if (cbError.message && cbError.message.includes('OPEN')) {
              throw new Error('CIRCUIT_OPEN');
            }
            throw cbError;
          });

          for await (const event of eventStream) {
            if (event.event === 'on_chat_model_stream') {
              const content = event.data?.chunk?.content;
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'token', content })}\n\n`)
                );
              }
            }

            if (event.event === 'on_chain_end' && event.name === 'agentGraph') {
              const finalState = event.data?.output;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: 'final',
                    agent: finalState?.currentAgent,
                    requiresHumanReview: finalState?.requiresHumanReview,
                    showUrgentHelp: finalState?.showUrgentHelp,
                    sources: finalState?.sources,
                  })}\n\n`
                )
              );
            }
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
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
