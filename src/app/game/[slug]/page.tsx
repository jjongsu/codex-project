import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GameShell } from '@/features/games/shared/components/game-shell';
import {
  GAME_SLUGS,
  getGameMetadata,
  isGameSlug,
} from '@/features/games';

interface GameDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return GAME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: GameDetailPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;

  if (!isGameSlug(slug)) {
    return {
      title: 'Game Not Found',
    };
  }

  const game = getGameMetadata(slug);

  return {
    title: `${game.name} | Retro Casual Web Portal`,
    description: game.description,
  };
}

export default async function GameDetailPage(props: GameDetailPageProps) {
  const { slug } = await props.params;

  if (!isGameSlug(slug)) {
    notFound();
  }

  const game = getGameMetadata(slug);

  return (
    <div
      id="game-detail-page"
      className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <div id="game-page-hero" className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          {game.category}
        </p>
        <h1 className="text-4xl font-semibold text-black">{game.name}</h1>
        <p className="max-w-3xl text-base leading-7 text-black/68">
          {game.description}
        </p>
      </div>

      <div id="game-page-shell">
        <GameShell game={game} />
      </div>
    </div>
  );
}
