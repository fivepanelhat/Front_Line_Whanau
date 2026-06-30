import { NextRequest } from 'next/server';
import { agentGraph } from '@/ai/graph';
import { HumanMessage, AIMessage } from '@langchain/core/messages';



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

export async function POST(req: NextRequest) {
  try {
    const { 
      query, 
      consentGiven = true, 
      threadId = `thread_${Date.now()}`,
      history = []
    } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
    }

    // Convert history into LangChain messages
    const safeHistory = Array.isArray(history) ? history.filter(isChatHistoryMessage) : [];

    const previousMessages = safeHistory.map((msg) =>
      msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    );

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          const eventStream = await agentGraph.streamEvents(
            {
              query,
              consentGiven,
              messages: [...previousMessages, new HumanMessage(query)],
            },
            {
              version: 'v2',
              configurable: { thread_id: threadId },
            }
          );

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
          controller.close();

        } catch (error: any) {
          // Handle LangGraph Interrupt
          if (error && (error.name === 'Interrupt' || error.name === 'GraphInterrupt')) {
            // Extract the proposed response from the interrupt value
            // Depending on the langgraph version, the payload might be in error.value or error.interrupt
            const interruptValue = error.value || error.interrupt || {};
            
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'interrupt',
                  message: 'This response requires human review before being sent.',
                  threadId,
                  requiresHumanReview: true,
                  proposedResponse: interruptValue.proposedResponse || '',
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          // Generic error
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              message: 'Something went wrong while processing your request.' 
            })}\n\n`)
          );
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
    console.error('API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
