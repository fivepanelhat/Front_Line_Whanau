import { NextRequest } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { agentGraph } from '@/ai/graph';
import { validateAgentInput, sanitizeAgentOutput, createAuditLog } from '@/ai/security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateAgentInput(body);

    createAuditLog('agent_request_received', {
      threadId: validated.threadId,
      hasConsent: validated.consentGiven,
      queryLength: validated.query.length,
    });

    const { query, consentGiven, threadId } = validated;
    const effectiveThreadId = threadId ?? `thread_${Date.now()}`;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!consentGiven) {
      createAuditLog('agent_request_blocked_no_consent', {
        threadId: effectiveThreadId,
      });
      return new Response(JSON.stringify({ error: 'Consent is required to use the agent' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let finalSent = false;

        const sendSse = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        };

        try {
          const eventStream = await agentGraph.streamEvents(
            {
              query,
              consentGiven,
              messages: [new HumanMessage(query)],
            },
            {
              version: 'v2',
              configurable: { thread_id: effectiveThreadId },
            }
          );

          for await (const event of eventStream) {
            if (event.event === 'on_chat_model_stream') {
              const content = event.data?.chunk?.content;

              if (typeof content === 'string' && content.length > 0) {
                sendSse({ type: 'token', content });
              }
            }

            if (event.event === 'on_chain_end') {
              const finalState = event.data?.output as
                | {
                    finalResponse?: string;
                    currentAgent?: string;
                    requiresHumanReview?: boolean;
                    showUrgentHelp?: boolean;
                    sources?: string[];
                  }
                | undefined;

              if (finalState?.finalResponse || finalState?.currentAgent) {
                const sanitizedContent = sanitizeAgentOutput(finalState?.finalResponse || '');

                sendSse({
                  type: 'final',
                  response: sanitizedContent,
                  agent: finalState?.currentAgent,
                  requiresHumanReview: finalState?.requiresHumanReview,
                  showUrgentHelp: finalState?.showUrgentHelp,
                  sources: finalState?.sources || [],
                });

                createAuditLog('agent_response_finalized', {
                  threadId: effectiveThreadId,
                  agent: finalState?.currentAgent,
                  requiresHumanReview: finalState?.requiresHumanReview,
                  sourceCount: finalState?.sources?.length || 0,
                });

                finalSent = true;
              }
            }
          }

          if (!finalSent) {
            sendSse({
              type: 'final',
              response: null,
              agent: null,
              requiresHumanReview: false,
              showUrgentHelp: false,
              sources: [],
            });
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          createAuditLog('agent_stream_error', {
            threadId: effectiveThreadId,
            error: error instanceof Error ? error.message : 'Unknown stream error',
          });
          console.error('Streaming error:', error);
          sendSse({ type: 'error', message: 'Agent processing failed' });
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    createAuditLog('agent_request_error', {
      error: error instanceof Error ? error.message : 'Unknown request error',
    });
    console.error('Request parsing error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
