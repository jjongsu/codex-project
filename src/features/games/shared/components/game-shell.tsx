'use client';

import type { GameMetadata } from '@/features/games';
import { useGameUiStore } from '@/features/games/shared/store/game-ui-store';

interface GameShellProps {
  game: GameMetadata;
}

export function GameShell({ game }: GameShellProps) {
  const isPaused = useGameUiStore((state) => state.isPaused);
  const isMuted = useGameUiStore((state) => state.isMuted);
  const setPaused = useGameUiStore((state) => state.setPaused);
  const toggleMuted = useGameUiStore((state) => state.toggleMuted);
  const reset = useGameUiStore((state) => state.reset);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
      <section className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="border-b border-black/10 bg-[color:var(--color-background-soft)] px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                Shared Game Shell
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-black">{game.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPaused(!isPaused)}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={toggleMuted}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-strong)]"
              >
                Reset UI State
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-black/15 bg-[radial-gradient(circle_at_top,_rgba(23,201,178,0.14),_transparent_52%),linear-gradient(135deg,_rgba(255,255,255,0.85),_rgba(249,240,219,0.9))] p-6 text-center">
            <div className="max-w-md space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-accent-strong)]">
                Phaser Mount Point
              </p>
              <h2 className="text-2xl font-semibold text-black">
                Game canvas and HUD will live here next
              </h2>
              <p className="text-sm leading-6 text-black/68">
                Keep this route page thin and mount a client game island here to
                avoid App Router and Phaser lifecycle conflicts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Score Rule
          </p>
          <p className="mt-3 text-sm font-medium text-black">
            Primary: {game.scoreRule.primaryMetric}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-black/68">
            {game.scoreRule.bonuses.map((bonus) => (
              <li key={bonus}>- {bonus}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-black/55">
            {game.scoreRule.validationHint}
          </p>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Planned Content
          </p>
          <div className="mt-4 space-y-3">
            {game.contentPlan.map((article) => (
              <div key={article.articleSlug} className="rounded-2xl bg-[color:var(--color-background-soft)] px-4 py-3">
                <p className="text-sm font-medium text-black">{article.title}</p>
                <p className="mt-1 text-xs text-black/50">{article.articleSlug}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
