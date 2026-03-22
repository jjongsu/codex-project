create extension if not exists pgcrypto;

create table if not exists public.high_scores (
  id uuid primary key default gen_random_uuid(),
  game_slug text not null check (
    game_slug in ('block-jam-blitz', 'snake-survivor', 'brick-shot-rush')
  ),
  player_name text not null check (player_name ~ '^[A-Z]{1,3}$'),
  score integer not null check (score >= 0),
  created_at timestamptz not null default now()
);

create index if not exists high_scores_game_slug_score_created_at_idx
  on public.high_scores (game_slug, score desc, created_at asc);

alter table public.high_scores enable row level security;
