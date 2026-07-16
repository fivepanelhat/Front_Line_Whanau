import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PractitionerNotesSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();

 // Verify user
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

 const parsed = PractitionerNotesSchema.safeParse(await req.json());
 if (!parsed.success) {
 return NextResponse.json({ error: 'Invalid input', details: parsed.error }, { status: 400 });
 }
 const { patient_reference, encrypted_content } = parsed.data;

 const { data, error } = await supabase
 .from('practitioner_notes')
 .insert({
 practitioner_id: user.id,
 patient_reference,
 encrypted_content
 })
 .select()
 .single();

 if (error) {
 console.error('Error saving note:', error);
 return NextResponse.json({ error: 'Failed to save note.' }, { status: 500 });
 }

 return NextResponse.json({ success: true, note: data });
 } catch (err: any) {
 console.error('API Route Error:', err);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}

export async function GET(req: NextRequest) {
 try {
 const supabase = await createClient();

 const { data: { user }, error: userError } = await supabase.auth.getUser();
 if (userError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { data, error } = await supabase
 .from('practitioner_notes')
 .select('*')
 .eq('practitioner_id', user.id)
 .order('created_at', { ascending: false });

 if (error) {
 console.error('Error fetching notes:', error);
 return NextResponse.json({ error: 'Failed to fetch notes.' }, { status: 500 });
 }

 return NextResponse.json({ notes: data });
 } catch (err: any) {
 console.error('API Route Error:', err);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
