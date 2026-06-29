import { NextRequest, NextResponse } from 'next/server';
import { agentGraph } from '@/ai/graph';
import { HumanMessage } from '@langchain/core/messages';

export async function POST(req: NextRequest) {
  try {
    const { query, consentGiven = false, threadId = 'default' } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const result = await agentGraph.invoke(
      {
        query,
        consentGiven,
        messages: [new HumanMessage(query)],
      },
      { configurable: { thread_id: threadId } }
    );

    return NextResponse.json({
      response: result.finalResponse,
      agent: result.currentAgent,
      requiresHumanReview: result.requiresHumanReview,
      showUrgentHelp: result.showUrgentHelp,
      sources: result.sources,
    });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Agent processing failed' }, { status: 500 });
  }
}
