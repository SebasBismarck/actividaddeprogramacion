create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Allow public read products" on public.products;
create policy "Allow public read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert products" on public.products;
create policy "Allow public insert products"
on public.products
for insert
to anon, authenticated
with check (true);
