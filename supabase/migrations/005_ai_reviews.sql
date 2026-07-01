create type public.ai_review_status as enum ('pending', 'approved', 'rejected');

create table public.ai_reviews (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  proposed_response text not null,
  status public.ai_review_status default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS policies
alter table public.ai_reviews enable row level security;

-- Practitioners and Admins can view all reviews
create policy "ai_reviews: admins and practitioners can view"
  on public.ai_reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );

-- Practitioners and Admins can update reviews
create policy "ai_reviews: admins and practitioners can update"
  on public.ai_reviews for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );

-- Anyone can insert a review (when the agent hits an interrupt)
create policy "ai_reviews: anyone can insert"
  on public.ai_reviews for insert
  with check (true);
