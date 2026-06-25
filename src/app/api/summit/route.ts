import { NextRequest, NextResponse } from 'next/server';
import { AetherSummit } from '@/ai/aether-summit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, scopes } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query' },
        { status: 400 }
      );
    }

    const summitInstance = new AetherSummit();
    const res = await summitInstance.process(query, scopes || []);

    return NextResponse.json(res);
  } catch (error) {
    console.error('Aether Summit API Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong running Aether Summit' },
      { status: 500 }
    );
  }
}
