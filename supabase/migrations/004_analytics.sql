-- Migration: 004_analytics.sql
-- Description: Sets up the analytics_events table for privacy-preserving outcome tracking.

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    path TEXT NOT NULL,
    session_hash TEXT NOT NULL, -- Daily rotating hash for anonymity
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking)
CREATE POLICY "Allow inserts from anyone"
ON public.analytics_events
FOR INSERT
TO public
WITH CHECK (true);

-- Allow reading only by admins
CREATE POLICY "Allow reads by admins only"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Grant privileges
GRANT INSERT ON public.analytics_events TO anon;
GRANT INSERT ON public.analytics_events TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
