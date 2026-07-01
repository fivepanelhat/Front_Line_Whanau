import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, createAuditLog } from '@/ai/security';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
  const isAllowed = await checkRateLimit(ip, 10, 60000);
  if (!isAllowed) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  createAuditLog('FEEDBACK_EXPORT', { ip });

  try {
    const supabase = await createClient();
    const { data: feedbacks, error } = await supabase
      .from('ai_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback for export:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    // Convert to CSV
    const headers = ['id', 'created_at', 'rating', 'message_content', 'thread_id'];
    const csvRows = [headers.join(',')];

    for (const fb of feedbacks || []) {
      const values = headers.map(header => {
        const val = fb[header as keyof typeof fb];
        const escaped = ('' + val).replace(/"/g, '""');
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
