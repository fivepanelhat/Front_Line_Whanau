import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { RateLimiter } from "@/lib/rate-limit";

const limiter = new RateLimiter(60_000, 30);

export async function GET(request: NextRequest) {
 const { searchParams } = new URL(request.url);
 const threadId = searchParams.get('threadId');

 if (!threadId) {
 return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
 }

 const ip = request.headers.get('x-forwarded-for') || 'anonymous';
 const allowed = await limiter.check(`review_status_${ip}`);
 if (!allowed) {
 return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 }

 try {
 // Admin client: the anonymous chat flow polls its own review status by
 // unguessable threadId, but ai_reviews' RLS select policy is
 // practitioner/admin-only, so the anon client always saw nothing.
 // Only the status string is exposed - never the content.
 const supabase = await createAdminClient();
 const { data: review, error } = await supabase
 .from('ai_reviews')
 .select('status')
 .eq('thread_id', threadId)
 .order('created_at', { ascending: false })
 .limit(1)
 .single();

 if (error && error.code !== 'PGRST116') throw error;

 return NextResponse.json({
 status: review?.status || 'not_found'
 });
 } catch (error: any) {
 return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
 }
}
