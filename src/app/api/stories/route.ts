import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('peer_stories')
      .insert({
        author_id: user.id,
        title,
        content,
        tags: tags || [],
        is_approved: false,
        cultural_safety_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting peer story:', error);
      return NextResponse.json({ error: 'Failed to submit peer story.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, story: data });
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    let isPrivileged = false;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      isPrivileged = profile?.role === 'admin' || profile?.role === 'practitioner';
    }

    let query = supabase
      .from('peer_stories')
      .select(
        'id, author_id, title, content, tags, is_approved, cultural_safety_approved, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (!isPrivileged) {
      query = query.eq('is_approved', true).eq('cultural_safety_approved', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching peer stories:', error);
      return NextResponse.json({ error: 'Failed to fetch stories.' }, { status: 500 });
    }

    return NextResponse.json({ stories: data });
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
