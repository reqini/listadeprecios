-- Reemplaza el subquery repetido "exists (select ... from profiles where role admin)"
-- por una función security definer — patrón recomendado por Supabase para evitar
-- que cada policy dispare su propia evaluación de RLS sobre profiles, y para
-- poder reusarla tal cual en las tablas de catálogo (Fase 2).

create function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy "profiles: admin lee todo" on public.profiles;

create policy "profiles: admin lee todo"
  on public.profiles for select
  using (public.is_admin());
