import { getContentHref, getGameHref } from '@/features/games/config/routes';
import { type GameMetadata, type GameSlug } from '@/features/games/types';

export const GAME_METADATA: GameMetadata[] = [
  {
    slug: 'block-jam-blitz',
    name: 'Block Jam Blitz',
    shortName: 'Block Jam',
    tagline: 'Drag blocks, clear lines, and keep the combo alive.',
    description:
      'An 8x8 placement puzzle built for short mobile-friendly runs, strong retry loops, and clean leaderboard competition.',
    priority: 1,
    status: 'planned',
    href: getGameHref('block-jam-blitz'),
    contentHref: getContentHref('block-jam-blitz-guide'),
    sessionLength: '3-5 minutes',
    controls: ['drag', 'mouse'],
    theme: 'Neon puzzle board with crisp combo feedback',
    category: 'Puzzle',
    heroSummary:
      'The safest MVP pick: clear lines, stack combos, and submit a score immediately after the board locks up.',
    scoreRule: {
      primaryMetric: 'placement and line-clear score',
      bonuses: ['multi-line clear', 'combo streak', 'board control'],
      validationHint: 'Cap suspicious score spikes relative to session length and clear count.',
    },
    contentPlan: [
      {
        articleSlug: 'block-jam-blitz-guide',
        title: 'Block Jam Blitz 기본 운영 가이드',
      },
      {
        articleSlug: 'block-jam-blitz-combo-tips',
        title: 'Block Jam Blitz 콤보 유지 팁',
      },
    ],
  },
  {
    slug: 'snake-survivor',
    name: 'Snake Survivor',
    shortName: 'Snake Survivor',
    tagline: 'Turn fast, survive longer, and pick the right perks.',
    description:
      'A survivor-style reinterpretation of Snake with quick runs, escalating threats, and perk-driven score runs.',
    priority: 2,
    status: 'planned',
    href: getGameHref('snake-survivor'),
    contentHref: getContentHref('snake-survivor-beginner-guide'),
    sessionLength: '4-6 minutes',
    controls: ['swipe', 'buttons', 'keyboard'],
    theme: 'Retro arena survival with bright hazard contrast',
    category: 'Arcade Action',
    heroSummary:
      'Classic Snake recognition mixed with survival pressure, perk choices, and wave-based escalation.',
    scoreRule: {
      primaryMetric: 'survival time score',
      bonuses: ['pellet collection', 'elite kills', 'streak bonus'],
      validationHint: 'Compare score against survival duration and capped event counts.',
    },
    contentPlan: [
      {
        articleSlug: 'snake-survivor-beginner-guide',
        title: 'Snake Survivor 초반 생존 가이드',
      },
      {
        articleSlug: 'snake-survivor-perk-guide',
        title: 'Snake Survivor 추천 퍼크 조합',
      },
    ],
  },
  {
    slug: 'brick-shot-rush',
    name: 'Brick Shot Rush',
    shortName: 'Brick Shot',
    tagline: 'Aim the volley, break the wall, and stop the danger line.',
    description:
      'A mobile-first brick shooter focused on aim, chain reactions, and satisfying short-session score runs.',
    priority: 3,
    status: 'planned',
    href: getGameHref('brick-shot-rush'),
    contentHref: getContentHref('brick-shot-rush-combo-guide'),
    sessionLength: '3-6 minutes',
    controls: ['drag', 'tap', 'mouse'],
    theme: 'High-contrast bricks and satisfying ricochet effects',
    category: 'Skill Puzzle',
    heroSummary:
      'A modern replacement for pure Breakout, trading paddle control for aim-and-release physics.',
    scoreRule: {
      primaryMetric: 'destroyed brick value score',
      bonuses: ['multi-break turn', 'combo chain', 'round survival'],
      validationHint: 'Limit outlier scores with round count and brick health totals.',
    },
    contentPlan: [
      {
        articleSlug: 'brick-shot-rush-combo-guide',
        title: 'Brick Shot Rush 반사각과 콤보 가이드',
      },
      {
        articleSlug: 'brick-shot-rush-ball-priority',
        title: 'Brick Shot Rush 추가 볼 운영 팁',
      },
    ],
  },
];

export const GAME_METADATA_BY_SLUG = Object.fromEntries(
  GAME_METADATA.map((game) => [game.slug, game]),
) as Record<GameSlug, GameMetadata>;

export const GAME_LAUNCH_ORDER = [...GAME_METADATA].sort(
  (left, right) => left.priority - right.priority,
);

export function getGameMetadata(slug: GameSlug): GameMetadata {
  return GAME_METADATA_BY_SLUG[slug];
}
