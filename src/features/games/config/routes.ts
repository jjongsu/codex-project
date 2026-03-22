import { GAME_SLUGS, type GameSlug } from '@/features/games/types';

export const APP_ROUTES = {
  home: '/',
  games: '/game',
  ranking: '/ranking',
  content: '/content',
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',
  api: {
    scores: '/api/scores',
  },
} as const;

export const GAME_ROUTE_SEGMENTS = {
  blockJamBlitz: 'block-jam-blitz',
  snakeSurvivor: 'snake-survivor',
  brickShotRush: 'brick-shot-rush',
} as const satisfies Record<string, GameSlug>;

const GAME_SLUG_SET = new Set<string>(GAME_SLUGS);

export function isGameSlug(value: string): value is GameSlug {
  return GAME_SLUG_SET.has(value);
}

export function getGameHref(slug: GameSlug): `/game/${GameSlug}` {
  return `${APP_ROUTES.games}/${slug}` as `/game/${GameSlug}`;
}

export function getGameScoreApiHref(slug: GameSlug): `${typeof APP_ROUTES.api.scores}?game=${GameSlug}` {
  return `${APP_ROUTES.api.scores}?game=${slug}`;
}

export function getContentHref(slug: string): `/content/${string}` {
  return `${APP_ROUTES.content}/${slug}`;
}
