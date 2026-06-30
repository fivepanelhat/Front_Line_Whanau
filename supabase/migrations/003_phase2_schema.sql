create type public.cultural_safety_status as enum ('pending', 'approved', 'flagged');

alter table public.directory_listings
add column cultural_review_status public.cultural_safety_status default 'pending';

create table public.peer_stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  tags text[],
  is_approved boolean default false,
  cultural_safety_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.peer_stories enable row level security;

create policy "peer_stories: authors can manage own"
  on public.peer_stories for all
  to authenticated
  using (author_id = auth.uid());

create policy "peer_stories: public can read approved"
  on public.peer_stories for select
  to authenticated
  using (is_approved = true and cultural_safety_approved = true);

create policy "peer_stories: admins and practitioners can read all for moderation"
  on public.peer_stories for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );
  
create policy "peer_stories: admins and practitioners can update for moderation"
  on public.peer_stories for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );

create table public.practitioner_notes (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid references public.profiles(id) on delete cascade not null,
  patient_reference text,
  encrypted_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.practitioner_notes enable row level security;

create policy "practitioner_notes: practitioners can manage own"
  on public.practitioner_notes for all
  to authenticated
  using (
    practitioner_id = auth.uid() and
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );
