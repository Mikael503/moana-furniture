-- Table newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- Activer RLS
alter table newsletter_subscribers enable row level security;

-- Seul le service role peut lire (pour exports marketing)
-- Les anonymes peuvent s'inscrire
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read subscribers"
  on newsletter_subscribers for select
  to service_role
  using (true);
