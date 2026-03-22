import Link from 'next/link';

import { GameCard } from '@/components/game/game-card';
import { APP_ROUTES, GAME_LAUNCH_ORDER } from '@/features/games';
import { createClient } from '@/utils/supabase/server';

const featuredGame = GAME_LAUNCH_ORDER[0];

type Todo = {
  id: number | string;
  name: string | null;
};

async function loadTodos() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('todos')
      .select('id, name')
      .limit(5);

    if (error) {
      return {
        status: 'query-error' as const,
        todos: [] as Todo[],
      };
    }

    return {
      status: 'ready' as const,
      todos: (data ?? []) as Todo[],
    };
  } catch {
    return {
      status: 'missing-env' as const,
      todos: [] as Todo[],
    };
  }
}

export default async function HomePage() {
  const { status, todos } = await loadTodos();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <section className="grid gap-8 rounded-[36px] bg-white/88 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.08)] lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-[color:var(--color-accent-strong)]">
            Initial Setup Ready
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-black sm:text-5xl">
              Retro-inspired browser games, rebuilt for short modern sessions.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-black/68 sm:text-lg">
              The scaffold now matches the project plan: shared game metadata,
              route constants, initial App Router pages, and score validation
              foundations are all in place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={APP_ROUTES.games}
              className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-strong)]"
            >
              Browse Games
            </Link>
            <Link
              href={featuredGame.href}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-black/5"
            >
              Open {featuredGame.shortName}
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-[linear-gradient(160deg,rgba(23,201,178,0.16),rgba(255,155,84,0.18))] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Launch Focus
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] bg-white/85 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                MVP
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {featuredGame.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-black/65">
                {featuredGame.heroSummary}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/85 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                  Session
                </p>
                <p className="mt-2 text-lg font-semibold text-black">
                  {featuredGame.sessionLength}
                </p>
              </div>
              <div className="rounded-[24px] bg-white/85 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                  Score Focus
                </p>
                <p className="mt-2 text-lg font-semibold text-black">
                  {featuredGame.scoreRule.primaryMetric}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[32px] bg-black px-8 py-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7bf2dd]">
            Supabase SSR
          </p>
          <h2 className="text-3xl font-semibold leading-tight">
            Session-aware data fetching is wired into the App Router.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-white/72 sm:text-base">
            This section uses the new server helper built on top of
            <code className="mx-1 rounded bg-white/10 px-2 py-1 text-[0.92em]">
              cookies()
            </code>
            so authenticated Supabase requests can reuse refreshed sessions.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur">
          {status === 'missing-env' ? (
            <p className="text-sm leading-7 text-white/72">
              Add the Supabase public URL and publishable key to
              <code className="mx-1 rounded bg-white/10 px-2 py-1 text-[0.92em]">
                .env.local
              </code>
              to enable session-aware queries.
            </p>
          ) : status === 'query-error' ? (
            <p className="text-sm leading-7 text-white/72">
              Supabase is reachable, but the
              <code className="mx-1 rounded bg-white/10 px-2 py-1 text-[0.92em]">
                todos
              </code>
              table is not returning rows yet. Create the table or adjust its
              policies to see data here.
            </p>
          ) : todos.length > 0 ? (
            <ul className="space-y-3">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/88"
                >
                  {todo.name ?? 'Untitled todo'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-white/72">
              Connected successfully, but there are no todo rows to show yet.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
              Game Catalog
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-black">
              Three trend-fit games, one shared score pipeline
            </h2>
          </div>
          <Link
            href={APP_ROUTES.ranking}
            className="text-sm font-medium text-black/65 transition hover:text-black"
          >
            View ranking scaffold
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {GAME_LAUNCH_ORDER.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
