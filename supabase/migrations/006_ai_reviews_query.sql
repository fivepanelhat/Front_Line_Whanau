-- Add query context to ai_reviews so practitioners can see what the user asked
alter table public.ai_reviews add column query text default '';
