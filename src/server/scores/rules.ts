import type { GameSlug } from '@/features/games';

import type { ScoreRule } from '@/server/scores/types';

export const SCORE_RULES: Record<GameSlug, ScoreRule> = {
  'block-jam-blitz': {
    minScore: 0,
    softMaxScore: 500000,
    minSessionDurationMs: 15000,
    heuristicNote:
      'Use placement count and clear streaks later to refine the score ceiling.',
  },
  'snake-survivor': {
    minScore: 0,
    softMaxScore: 250000,
    minSessionDurationMs: 20000,
    heuristicNote:
      'Compare survival duration against pellet count and elite kills before persisting.',
  },
  'brick-shot-rush': {
    minScore: 0,
    softMaxScore: 300000,
    minSessionDurationMs: 12000,
    heuristicNote:
      'Round count and brick health totals should drive the next validation pass.',
  },
};
