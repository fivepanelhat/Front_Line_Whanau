import { NextRequest } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { agentGraph } from '@/ai/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { query, consentGiven = true, threadId = `thread_${Date.now()}` } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
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
              configurable: { thread_id: threadId },
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
                sendSse({
                  type: 'final',
                  response: finalState?.finalResponse,
                  agent: finalState?.currentAgent,
                  requiresHumanReview: finalState?.requiresHumanReview,
                  showUrgentHelp: finalState?.showUrgentHelp,
                  sources: finalState?.sources || [],
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
    console.error('Request parsing error:', error);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
