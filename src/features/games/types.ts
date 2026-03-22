export const GAME_SLUGS = [
  'block-jam-blitz',
  'snake-survivor',
  'brick-shot-rush',
] as const;

export type GameSlug = (typeof GAME_SLUGS)[number];

export type GameStatus = 'planned' | 'in-development' | 'ready';
export type GamePriority = 1 | 2 | 3;
export type GameControlTag =
  | 'drag'
  | 'tap'
  | 'swipe'
  | 'buttons'
  | 'keyboard'
  | 'mouse';

export interface GameScoreRuleSummary {
  primaryMetric: string;
  bonuses: string[];
  validationHint: string;
}

export interface GameContentPlan {
  articleSlug: string;
  title: string;
}

export interface GameMetadata {
  slug: GameSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  priority: GamePriority;
  status: GameStatus;
  href: `/game/${GameSlug}`;
  contentHref: `/content/${string}`;
  sessionLength: string;
  controls: GameControlTag[];
  theme: string;
  category: string;
  heroSummary: string;
  scoreRule: GameScoreRuleSummary;
  contentPlan: GameContentPlan[];
}
