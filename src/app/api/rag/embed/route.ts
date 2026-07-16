import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export async function POST(req: NextRequest) {
 try {
 const supabase = await createClient();

 // Verify user role
 const { data: { user }, error: userError } = await supabase.auth.getUser();
 if (userError || !user) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 const { data: profile } = await supabase
 .from('profiles')
 .select('role')
 .eq('id', user.id)
 .single();

 if (profile?.role !== 'admin' && profile?.role !== 'practitioner') {
 return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
 }

 const { document_id, content, metadata = {} } = await req.json();

 if (!document_id || !content) {
 return NextResponse.json({ error: 'document_id and content are required' }, { status: 400 });
 }

 // Generate embedding using LangChain Google GenAI
 const embeddings = new GoogleGenerativeAIEmbeddings({
 model: "text-embedding-004", // Standard 768-dim model
 });

 // In a real production pipeline, you would use a RecursiveCharacterTextSplitter 
 // to chunk large text first, but this handles simple pre-chunked input.
 const vector = await embeddings.embedQuery(content);

 const { data, error } = await supabase
 .from('document_embeddings')
 .insert({
 document_id,
 content,
 metadata,
 embedding: vector,
 })
 .select()
 .single();

 if (error) {
 console.error('Error inserting embedding:', error);
 return NextResponse.json({ error: 'Failed to insert embedding' }, { status: 500 });
 }

 return NextResponse.json({ success: true, embedding_id: data.id });
 } catch (err: any) {
 console.error('API Route Error:', err);
 return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
 }
}
