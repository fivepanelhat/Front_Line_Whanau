import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export interface Conversation {
 id: string;
 thread_id: string;
 title: string;
 created_at: string;
 updated_at: string;
}

export interface Message {
 id?: string;
 conversation_id: string;
 role: 'user' | 'assistant';
 content: string;
 created_at?: string;
}

export interface MessageInput {
 role: 'user' | 'assistant';
 content: string;
}

// ============================================================
// CLIENT (lazy - must not throw during `next build` without env)
// ============================================================

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if (!url || !key) {
 return null;
 }
 if (!_supabase) {
 _supabase = createClient(url, key);
 }
 return _supabase;
}

// ============================================================
// CONVERSATION FUNCTIONS
// ============================================================

/**
 * Save or update a conversation and its messages
 */
export async function saveConversation(
 threadId: string,
 messages: MessageInput[]
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
 try {
 const supabase = getSupabase();
 if (!supabase) {
 return { success: false, error: 'Supabase is not configured' };
 }
 if (messages.length === 0) {
 return { success: false, error: 'No messages to save' };
 }

 // Create or update conversation
 const title = messages[0].content.substring(0, 80);

 const { data: conversation, error: convError } = await supabase
 .from('conversations')
 .upsert(
 {
 thread_id: threadId,
 title,
 updated_at: new Date().toISOString(),
 },
 { onConflict: 'thread_id' }
 )
 .select()
 .single<Conversation>();

 if (convError || !conversation) {
 return { success: false, error: convError?.message || 'Failed to save conversation' };
 }

 // Delete old messages and insert new ones (simple approach)
 await supabase.from('messages').delete().eq('conversation_id', conversation.id);

 const messagesToInsert = messages.map((msg) => ({
 conversation_id: conversation.id,
 role: msg.role,
 content: msg.content,
 }));

 const { error: msgError } = await supabase.from('messages').insert(messagesToInsert);

 if (msgError) {
 return { success: false, error: msgError.message };
 }

 return { success: true, conversationId: conversation.id };
 } catch (error: unknown) {
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Unknown error',
 };
 }
}

/**
 * Load a conversation by threadId
 */
export async function loadConversation(threadId: string): Promise<{
 conversation: Conversation | null;
 messages: Message[];
}> {
 try {
 const supabase = getSupabase();
 if (!supabase) {
 return { conversation: null, messages: [] };
 }
 const { data: conversation } = await supabase
 .from('conversations')
 .select('*')
 .eq('thread_id', threadId)
 .single();

 if (!conversation) {
 return { conversation: null, messages: [] };
 }

 const { data: messages } = await supabase
 .from('messages')
 .select('*')
 .eq('conversation_id', conversation.id)
 .order('created_at', { ascending: true });

 return {
 conversation,
 messages: messages || [],
 };
 } catch {
 return { conversation: null, messages: [] };
 }
}

/**
 * List recent conversations
 */
export async function listRecentConversations(limit = 20): Promise<Conversation[]> {
 const supabase = getSupabase();
 if (!supabase) return [];
 const { data } = await supabase
 .from('conversations')
 .select('*')
 .order('updated_at', { ascending: false })
 .limit(limit);

 return data || [];
}

/**
 * Delete a conversation
 */
export async function deleteConversation(threadId: string): Promise<boolean> {
 try {
 const supabase = getSupabase();
 if (!supabase) return false;
 const { data: conv } = await supabase
 .from('conversations')
 .select('id')
 .eq('thread_id', threadId)
 .single();

 if (!conv) return false;

 await supabase.from('messages').delete().eq('conversation_id', conv.id);
 await supabase.from('conversations').delete().eq('id', conv.id);

 return true;
 } catch {
 return false;
 }
}
