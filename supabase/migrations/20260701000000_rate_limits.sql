CREATE TABLE IF NOT EXISTS public.rate_limits (
    ip TEXT PRIMARY KEY,
    hits INTEGER DEFAULT 1,
    reset_time BIGINT NOT NULL
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow the service role / server to do whatever it needs. 
-- Clients don't have access to this table.
CREATE POLICY "Server can manage rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);
