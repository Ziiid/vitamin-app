-- Kör detta i Supabase SQL Editor

-- Profiler
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  age integer not null,
  sex text not null check (sex in ('male', 'female')),
  weight numeric not null,
  height numeric not null,
  goals text[] not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Dagliga loggar
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  vitamin_id text not null,
  logged_at timestamptz default now(),
  unique(user_id, date, vitamin_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table daily_logs enable row level security;

create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = user_id);

create policy "Users can manage own logs"
  on daily_logs for all using (auth.uid() = user_id);

-- Funktion för att radera eget konto (GDPR rätt till radering)
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;
