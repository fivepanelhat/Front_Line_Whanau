import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();

 // Verify user
 const { data: { user }, error: userError } = await supabase.auth.getUser();
 if (userError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 // Verify role is admin
 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single();

 if (profile?.role !== 'admin') {
 return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
 }

 const body = await req.json();
 const { id } = body as Record<string, unknown>;

 if (!id || typeof id !== 'string') {
 return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
 }

 const { data, error } = await supabase
 .from('directory_listings')
 .update({ is_verified: true })
 .eq('id', id)
 .select()
 .single();

 if (error) {
 console.error('Error approving directory listing:', error);
 return NextResponse.json({ error: 'Failed to approve listing.' }, { status: 500 });
 }

 return NextResponse.json({ success: true, listing: data });
 } catch (err: any) {
 console.error('API Route Error:', err);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
