-- =====================================================================
-- FinançasPessoais App — Schema inicial
-- Rodar no SQL Editor do Supabase (copie e cole o arquivo inteiro).
-- =====================================================================

create extension if not exists "pgcrypto";

-- =====================================================================
-- Tabela: categories (por usuário — cada um cria/edita/exclui as suas)
-- =====================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  kind text not null check (kind in ('income', 'expense', 'both')),
  color text not null default '#64748b',
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index if not exists categories_user_id_idx on public.categories(user_id);

-- =====================================================================
-- Tabela: transactions
-- =====================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12,2) not null check (amount > 0),
  date date not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_user_date_idx on public.transactions(user_id, date desc);
create index if not exists transactions_category_id_idx on public.transactions(category_id);

-- =====================================================================
-- Trigger: updated_at automático
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row
  execute function public.set_updated_at();

-- =====================================================================
-- Trigger: seed de categorias padrão ao criar novo usuário
--
-- Quando um usuário se cadastra (INSERT em auth.users), criamos um
-- conjunto de categorias iniciais para ele. Security definer é
-- necessário porque o trigger roda no contexto do auth schema e precisa
-- inserir em public.categories ignorando RLS.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categories (user_id, name, slug, kind, color) values
    (new.id, 'Salário',      'salario',      'income',  '#22c55e'),
    (new.id, 'Freelance',    'freelance',    'income',  '#10b981'),
    (new.id, 'Alimentação',  'alimentacao',  'expense', '#f97316'),
    (new.id, 'Transporte',   'transporte',   'expense', '#3b82f6'),
    (new.id, 'Moradia',      'moradia',      'expense', '#8b5cf6'),
    (new.id, 'Saúde',        'saude',        'expense', '#ef4444'),
    (new.id, 'Lazer',        'lazer',        'expense', '#ec4899'),
    (new.id, 'Educação',     'educacao',     'expense', '#14b8a6'),
    (new.id, 'Compras',      'compras',      'expense', '#eab308'),
    (new.id, 'Outros',       'outros',       'both',    '#64748b');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================

-- categories: cada usuário vê/edita/exclui somente as suas
alter table public.categories enable row level security;

drop policy if exists "categories_select_own" on public.categories;
create policy "categories_select_own"
  on public.categories
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "categories_insert_own" on public.categories;
create policy "categories_insert_own"
  on public.categories
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "categories_update_own" on public.categories;
create policy "categories_update_own"
  on public.categories
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "categories_delete_own" on public.categories;
create policy "categories_delete_own"
  on public.categories
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- transactions: cada usuário só vê/edita as próprias
alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
  on public.transactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
  on public.transactions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
  on public.transactions
  for delete
  to authenticated
  using (auth.uid() = user_id);
