import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = await createClient();
    const { data: reviews, error } = await supabase
      .from('ai_reviews')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Failed to fetch ai_reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
