import Link from 'next/link';

import { GameCard } from '@/components/game/game-card';
import { APP_ROUTES, GAME_LAUNCH_ORDER } from '@/features/games';

const featuredGame = GAME_LAUNCH_ORDER[0];

export default function HomePage() {
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
