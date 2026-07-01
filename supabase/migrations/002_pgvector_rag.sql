-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store document embeddings
create table public.document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  content text not null,
  metadata jsonb,
  embedding vector(768) -- Google GenAI text-embedding-004 output dimension
);

-- RLS policies
alter table public.document_embeddings enable row level security;

-- Only admins/practitioners can insert embeddings
create policy "document_embeddings: admins and practitioners can insert"
  on public.document_embeddings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'practitioner')
    )
  );

-- Everyone can read embeddings (for RAG search)
create policy "document_embeddings: public read"
  on public.document_embeddings for select
  to authenticated
  using (true);

-- Create a function to similarity search embeddings (cosine distance)
create or replace function match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    document_id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from public.document_embeddings
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
