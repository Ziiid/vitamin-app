-- Kör detta i Supabase SQL Editor

-- Lägg till time_of_day i daily_logs (om det saknas)
alter table daily_logs add column if not exists time_of_day text not null default 'morning';

-- Drop gamla unique constraint och lägg till ny som inkluderar time_of_day
alter table daily_logs drop constraint if exists daily_logs_user_id_date_vitamin_id_key;
alter table daily_logs add constraint daily_logs_unique unique(user_id, date, vitamin_id, time_of_day);

-- Vattenkonsumtion
create table if not exists daily_water (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  glasses integer not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table daily_water enable row level security;
create policy "Users can manage own water logs"
  on daily_water for all using (auth.uid() = user_id);

-- Makrologg (protein, carbs)
create table if not exists daily_macro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, date)
);

alter table daily_macro enable row level security;
create policy "Users can manage own macro logs"
  on daily_macro for all using (auth.uid() = user_id);
