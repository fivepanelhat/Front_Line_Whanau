import { NextRequest, NextResponse } from 'next/server';
import { TaongaKnowledgeWeaver } from '@/ai/knowledge-weaver';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const weaver = new TaongaKnowledgeWeaver();
    const result = await weaver.process(query, {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
