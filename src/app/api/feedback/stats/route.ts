import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
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

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let dbQuery = supabase
      .from('ai_feedback')
      .select('id, created_at, rating, agent, message_content, comment')
      .limit(2000);

    if (query.from) dbQuery = dbQuery.gte('created_at', query.from);
    if (query.to) dbQuery = dbQuery.lte('created_at', query.to);
    if (query.agent) dbQuery = dbQuery.eq('agent', query.agent);

    const { data, error } = await dbQuery;

    if (error) throw error;

    // === Summary KPIs ===
    const total = data.length;
    // Map 'up'/'down' to 'positive'/'negative' based on our schema
    const positive = data.filter((d) => d.rating === 'positive' || d.rating === 'up' || d.rating === 1).length;
    const negative = data.filter((d) => d.rating === 'negative' || d.rating === 'down' || d.rating === -1).length;
    const positiveRate = total > 0 ? Math.round((positive / total) * 100) : 0;

    // === Feedback by Agent ===
    const byAgent = Object.values(
      data.reduce((acc: any, item) => {
        const key = item.agent || 'unknown';
        if (!acc[key]) acc[key] = { agent: key, up: 0, down: 0, total: 0 };

        const isPositive = item.rating === 'positive' || item.rating === 'up' || item.rating === 1;
        acc[key][isPositive ? 'up' : 'down']++;
        acc[key].total++;
        return acc;
      }, {})
    );

    // === Trend Over Time (daily) ===
    const trendMap: Record<string, { date: string; up: number; down: number }> = {};
    data.forEach((item) => {
      const date = item.created_at.split('T')[0];
      if (!trendMap[date]) trendMap[date] = { date, up: 0, down: 0 };

      const isPositive = item.rating === 'positive' || item.rating === 'up' || item.rating === 1;
      trendMap[date][isPositive ? 'up' : 'down']++;
    });
    const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    // === Needs Attention (recent negative feedback) ===
    const needsAttention = data
      .filter((d) => d.rating === 'negative' || d.rating === 'down' || d.rating === -1)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10)
      .map((d) => ({
        id: d.id,
        created_at: d.created_at,
        agent: d.agent,
        query: d.message_content, // Map to what the frontend might expect
        response: d.message_content, // Map to what the frontend might expect
        review_status: 'pending', // Mocked if not present
      }));

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
