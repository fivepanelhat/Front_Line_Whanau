import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();

 const { data: { user }, error: userError } = await supabase.auth.getUser();
 if (userError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const formData = await req.formData();
 const file = formData.get('file') as File | null;
 const customFilename = formData.get('filename') as string | null;
 const isEncrypted = formData.get('is_encrypted') === 'on';

 if (!file) {
 return NextResponse.json({ error: 'No file provided' }, { status: 400 });
 }

 const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
 if (file.size > MAX_FILE_SIZE) {
 return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 });
 }

 const ALLOWED_TYPES = new Set([
 'application/pdf',
 'image/jpeg', 'image/png', 'image/webp',
 'text/plain', 'text/csv',
 'application/msword',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 ]);
 if (!ALLOWED_TYPES.has(file.type)) {
 return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
 }

 const bytes = await file.arrayBuffer();
 const buffer = Buffer.from(bytes);

 // In a production environment, if isEncrypted is true, we would expect the 
 // client to have already encrypted the file using the Web Crypto API, or we 
 // would encrypt it here using a server-side KMS.
 // For Phase 0 MVP, we upload directly to Supabase which has at-rest encryption.

 const fileExt = file.name.split('.').pop();
 const storagePath = `${user.id}/${uuidv4()}.${fileExt}`;

 // Upload to Supabase Storage bucket 'documents'
 const { error: storageError } = await supabase.storage
 .from('documents')
 .upload(storagePath, buffer, {
 contentType: file.type,
 upsert: false
 });

 if (storageError) {
 console.error('Storage error:', storageError);
 
 // If the bucket doesn't exist yet, we can gracefully fallback or alert
 if (storageError.message.includes('Bucket not found')) {
 return NextResponse.json({ error: 'Storage bucket "documents" is not configured yet.' }, { status: 500 });
 }
 return NextResponse.json({ error: 'Failed to upload file to storage.' }, { status: 500 });
 }

 // Insert record into public.documents
 const { data: docData, error: dbError } = await supabase
 .from('documents')
 .insert({
 user_id: user.id,
 filename: customFilename || file.name,
 storage_path: storagePath,
 file_size: file.size,
 mime_type: file.type,
 is_encrypted: isEncrypted
 })
 .select()
 .single();

 if (dbError) {
 console.error('Database error:', dbError);
 return NextResponse.json({ error: 'Failed to save document metadata.' }, { status: 500 });
 }

 return NextResponse.json({ success: true, document: docData });
 } catch (err: any) {
 console.error('API Route Error:', err);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
