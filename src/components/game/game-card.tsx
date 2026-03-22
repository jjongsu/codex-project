import Link from 'next/link';

import type { GameMetadata } from '@/features/games';

interface GameCardProps {
  game: GameMetadata;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Priority 0{game.priority}
          </p>
          <h2 className="text-2xl font-semibold text-black">{game.name}</h2>
        </div>
        <span className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-accent-strong)]">
          {game.category}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-black/68">{game.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {game.controls.map((control) => (
          <span
            key={control}
            className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60"
          >
            {control}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-3 rounded-[24px] bg-[color:var(--color-background-soft)] p-4">
        <p className="text-sm font-medium text-black">{game.tagline}</p>
        <p className="text-xs leading-5 text-black/60">{game.heroSummary}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-black/45">
          Session {game.sessionLength}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <div className="text-xs text-black/50">
          Score focus: {game.scoreRule.primaryMetric}
        </div>
        <Link
          href={game.href}
          className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition group-hover:bg-[color:var(--color-accent-strong)]"
        >
          Open Game
        </Link>
      </div>
    </article>
  );
}
