-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create organizations table
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Create profiles table
create table if not exists profiles (
  id uuid primary key,               -- matches auth.users.id
  email text unique,
  created_at timestamptz default now()
);

-- Create memberships table
create table if not exists memberships (
  user_id uuid references profiles(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  role text not null default 'member', -- 'owner' | 'admin' | 'member'
  primary key (user_id, org_id)
);

-- Create subscriptions table (simplified for mock Stripe)
create table if not exists subscriptions (
  org_id uuid primary key references organizations(id) on delete cascade,
  status text not null default 'active',              -- 'active' | 'canceled'
  plan text default 'free',                           -- 'free' | 'pro'
  created_at timestamptz default now()
);

-- Create sites table (your domain data)
create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  site_type text,
  location text,
  status text default 'active',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table subscriptions enable row level security;
alter table sites enable row level security;

-- Profiles policy - users can only see their own profile
create policy "profiles are self" on profiles
  for select using ( id = auth.uid() );

create policy "profiles can update self" on profiles
  for update using ( id = auth.uid() );

-- Organizations policy - user must be a member
create policy "orgs member can select" on organizations
  for select using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = organizations.id 
      and m.user_id = auth.uid()
    ) 
  );

create policy "orgs owner can update" on organizations
  for update using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = organizations.id 
      and m.user_id = auth.uid() 
      and m.role = 'owner'
    ) 
  );

create policy "orgs can insert" on organizations
  for insert with check ( true );

-- Memberships policies
create policy "memberships readable by member" on memberships
  for select using ( 
    user_id = auth.uid() or 
    exists (
      select 1 from memberships m 
      where m.org_id = memberships.org_id 
      and m.user_id = auth.uid()
    ) 
  );

create policy "memberships insertable by owner" on memberships
  for insert with check ( 
    exists (
      select 1 from memberships m 
      where m.org_id = org_id 
      and m.user_id = auth.uid() 
      and m.role = 'owner'
    ) or auth.uid() = user_id -- Allow self-insertion for first org
  );

-- Subscriptions policies
create policy "subscriptions readable by member" on subscriptions
  for select using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = subscriptions.org_id 
      and m.user_id = auth.uid()
    ) 
  );

create policy "subscriptions updatable by owner" on subscriptions
  for all using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = subscriptions.org_id 
      and m.user_id = auth.uid() 
      and m.role = 'owner'
    ) 
  );

-- Sites policies
create policy "sites by org" on sites
  for select using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = sites.org_id 
      and m.user_id = auth.uid()
    ) 
  );

create policy "sites insert by member" on sites
  for insert with check ( 
    exists (
      select 1 from memberships m 
      where m.org_id = org_id 
      and m.user_id = auth.uid()
    ) 
  );

create policy "sites update by member" on sites
  for update using ( 
    exists (
      select 1 from memberships m 
      where m.org_id = sites.org_id 
      and m.user_id = auth.uid()
    ) 
  );

-- Function to handle new user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email) 
  values (new.id, new.email) 
  on conflict (id) do nothing;
  return new;
end; 
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created 
  after insert on auth.users 
  for each row execute procedure handle_new_user();

-- Insert some sample data for development
insert into organizations (id, name) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'Metro de Santiago'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Organization')
on conflict (id) do nothing;

insert into sites (id, org_id, name, site_type, location, status) values 
  ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Estación Baquedano', 'station', 'Línea 1', 'active'),
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Túnel Sector 5', 'tunnel', 'Línea 2', 'maintenance'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Estación Los Héroes', 'station', 'Línea 2', 'active'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Patio de Maniobras', 'depot', 'Línea 4', 'inspection')
on conflict (id) do nothing;

insert into subscriptions (org_id, status, plan) values 
  ('550e8400-e29b-41d4-a716-446655440000', 'active', 'pro'),
  ('550e8400-e29b-41d4-a716-446655440001', 'active', 'free')
on conflict (org_id) do nothing;