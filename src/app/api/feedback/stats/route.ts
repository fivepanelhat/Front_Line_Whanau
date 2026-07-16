import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const StatsQuerySchema = z.object({
 from: z.string().optional(),
 to: z.string().optional(),
 agent: z.string().optional(),
});

import { connection } from 'next/server';

export async function GET(req: NextRequest) {
 await connection();
 try {
 const authClient = await createServerClient();
 const { data: { user }, error: userError } = await authClient.auth.getUser();
 if (userError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { data: profile } = await authClient
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single();

 if (profile?.role !== 'admin') {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }

 const { searchParams } = new URL(req.url);
 const query = StatsQuerySchema.parse({
 from: searchParams.get('from') || undefined,
 to: searchParams.get('to') || undefined,
 agent: searchParams.get('agent') || undefined,
 });

 const supabase = await createAdminClient();

 let dbQuery = supabase
 .from('ai_feedback')
 .select('id, created_at, rating, agent, message_content, comment')
 .order('created_at', { ascending: false })
 .limit(2000);

 if (query.from) dbQuery = dbQuery.gte('created_at', query.from);
 if (query.to) dbQuery = dbQuery.lte('created_at', query.to);
 if (query.agent) dbQuery = dbQuery.eq('agent', query.agent);

 const { data, error } = await dbQuery;

 if (error) throw error;

 // Map 'up'/'down' to 'positive'/'negative' based on our schema
 const isPositive = (r: unknown) => r === 'positive' || r === 'up' || r === 1;

 // Single pass over the (newest-first) rows: KPIs, per-agent counts,
 // daily trend, and the 10 most recent negatives.
 const total = data.length;
 let positive = 0;
 const agentMap: Record<string, { agent: string; up: number; down: number; total: number }> = {};
 const trendMap: Record<string, { date: string; up: number; down: number }> = {};
 const needsAttention: Array<Record<string, unknown>> = [];

 for (const item of data) {
 const up = isPositive(item.rating);
 if (up) positive++;

 const key = item.agent || 'unknown';
 const agentEntry = (agentMap[key] ??= { agent: key, up: 0, down: 0, total: 0 });
 agentEntry[up ? 'up' : 'down']++;
 agentEntry.total++;

 const date = item.created_at.split('T')[0];
 const trendEntry = (trendMap[date] ??= { date, up: 0, down: 0 });
 trendEntry[up ? 'up' : 'down']++;

 if (!up && needsAttention.length < 10) {
 needsAttention.push({
 id: item.id,
 created_at: item.created_at,
 agent: item.agent,
 query: item.message_content, // Map to what the frontend might expect
 response: item.message_content, // Map to what the frontend might expect
 review_status: 'pending', // Mocked if not present
 });
 }
 }

 const negative = total - positive;
 const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;
 const byAgent = Object.values(agentMap);
 const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

 return NextResponse.json({
 summary: {
 total,
 positive,
 negative,
 positiveRate,
 },
 byAgent,
 trend,
 needsAttention,
 });
 } catch (error) {
 console.error('Feedback stats error:', error);
 return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
 }
}
