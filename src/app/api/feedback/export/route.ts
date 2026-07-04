import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuditLog } from '@/ai/security';
import { RateLimiter } from '@/lib/rate-limit';

const limiter = new RateLimiter(60_000, 10);

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'practitioner' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isAllowed = await limiter.check(`feedback_export_${user.id}`);
    if (!isAllowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    createAuditLog('FEEDBACK_EXPORT', { userId: user.id });

    const { data: feedbacks, error } = await supabase
      .from('ai_feedback')
      .select('id, created_at, rating, message_content, thread_id')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('Error fetching feedback for export:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Convert to CSV
    const headers = ['id', 'created_at', 'rating', 'message_content', 'thread_id'];
    const csvRows = [headers.join(',')];

    for (const fb of feedbacks || []) {
      const values = headers.map(header => {
        let val = '' + (fb[header as keyof typeof fb] ?? '');
        if (/^[=+\-@\t\r]/.test(val)) val = "'" + val;
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="feedback_export.csv"',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
