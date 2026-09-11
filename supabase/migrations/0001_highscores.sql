create table if not exists public.highscores (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 20),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

alter table public.highscores enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'highscores' and policyname = 'Anyone can read highscores'
  ) then
    create policy "Anyone can read highscores"
      on public.highscores for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'highscores' and policyname = 'Anyone can insert a highscore'
  ) then
    create policy "Anyone can insert a highscore"
      on public.highscores for insert
      to anon
      with check (true);
  end if;
end
$$;
