import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { organisation, service_type, region, contact_email, contact_phone, website_url, description } = body as Record<string, string | undefined>;

    if (!organisation || !service_type || !region || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (website_url && !/^https?:\/\/.+/.test(website_url)) {
      return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 });
    }
    if (contact_phone && !/^[\d\s+\-()]{6,20}$/.test(contact_phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('directory_listings')
      .insert({
        created_by: user.id,
        organisation,
        service_type,
        region,
        contact_email,
        contact_phone,
        website_url,
        description,
        is_verified: false,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting directory listing:', error);
      return NextResponse.json({ error: 'Failed to create listing. Ensure your profile has practitioner access.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, listing: data });
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
