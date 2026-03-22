import { GameCard } from '@/components/game/game-card';
import { GAME_LAUNCH_ORDER } from '@/features/games';

export default function GamesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          /game
        </p>
        <h1 className="text-4xl font-semibold text-black">Game Routes</h1>
        <p className="max-w-2xl text-base leading-7 text-black/68">
          These route shells are wired to shared metadata so future UI, Phaser
          scenes, and score flows stay aligned with the same game catalog.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {GAME_LAUNCH_ORDER.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </div>
  );
}
