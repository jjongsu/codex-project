import { GAME_LAUNCH_ORDER } from '@/features/games';

export default function RankingPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          /ranking
        </p>
        <h1 className="text-4xl font-semibold text-black">Ranking Scaffold</h1>
        <p className="max-w-2xl text-base leading-7 text-black/68">
          The UI is ready for game-scoped top scores and later filters like
          today, weekly, and all-time.
        </p>
      </div>

      <div className="grid gap-4">
        {GAME_LAUNCH_ORDER.map((game, index) => (
          <section
            key={game.slug}
            className="rounded-[28px] border border-black/10 bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-black/45">
                  Queue 0{index + 1}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-black">{game.name}</h2>
              </div>
              <p className="rounded-full bg-[color:var(--color-accent-soft)] px-3 py-1 text-xs font-medium text-[color:var(--color-accent-strong)]">
                leaderboard pending
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
