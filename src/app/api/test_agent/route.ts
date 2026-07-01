import { NextRequest, NextResponse } from 'next/server';
import { Riroriro } from '@/ai/agents/riroriro';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    const weaver = new Riroriro();
    const result = await weaver.process(query, {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
