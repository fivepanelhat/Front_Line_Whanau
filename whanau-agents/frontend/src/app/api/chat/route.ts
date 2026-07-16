import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
 const body = await request.json();

 const res = await fetch('http://localhost:8000/run', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 task: body.task,
 thread_id: body.thread_id,
 }),
 });

 if (!res.ok) {
 return NextResponse.json({ error: 'Agent service error' }, { status: 500 });
 }

 const data = await res.json();
 return NextResponse.json(data);
}
