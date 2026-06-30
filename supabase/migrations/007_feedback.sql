-- Create AI Feedback table
CREATE TABLE ai_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id TEXT NOT NULL,
    message_content TEXT,
    rating INTEGER NOT NULL CHECK (rating IN (1, -1)), -- 1 for thumbs up, -1 for thumbs down
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public insertion for beta feedback (could restrict to authenticated users later)
CREATE POLICY "Enable insert for everyone" ON ai_feedback FOR INSERT WITH CHECK (true);

-- Only practitioners can view feedback
CREATE POLICY "Enable read for authenticated practitioners" ON ai_feedback FOR SELECT USING (auth.role() = 'authenticated');
