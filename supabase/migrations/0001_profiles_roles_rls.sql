-- Fase 1: perfiles + roles + RLS.
-- Corre esto en el SQL editor de Supabase (o via `supabase db push` con la CLI)
-- una vez que el proyecto esté creado.

create type public.user_role as enum ('admin', 'cliente');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  role public.user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

-- Cada usuario nuevo (via Supabase Auth) obtiene un profile con rol 'cliente'
-- por defecto. Los admins se promueven a mano desde el SQL editor:
--   update public.profiles set role = 'admin' where username = 'cocinaty';
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

-- Cualquier usuario autenticado puede leer su propio profile (para saber su rol).
create policy "profiles: leer el propio"
  on public.profiles for select
  using (auth.uid() = id);

-- Solo un admin puede leer/editar profiles ajenos (gestión de usuarios futura).
create policy "profiles: admin lee todo"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Helper reutilizable en las políticas de las tablas de catálogo (Fase 2):
-- exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
