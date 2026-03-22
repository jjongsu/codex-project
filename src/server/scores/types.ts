import { z } from 'zod';

import { GAME_SLUGS, type GameSlug } from '@/features/games';

export const scoreSubmissionSchema = z.object({
  gameSlug: z.enum(GAME_SLUGS),
  playerName: z.string().trim().min(1).max(3),
  score: z.number().int().nonnegative(),
  sessionDurationMs: z.number().int().positive().max(60 * 60 * 1000).optional(),
  metrics: z.record(z.string(), z.number().finite()).optional(),
});

export type ScoreSubmissionInput = z.infer<typeof scoreSubmissionSchema>;

export interface ScoreRule {
  minScore: number;
  softMaxScore: number;
  minSessionDurationMs?: number;
  heuristicNote: string;
}

export interface ScoreValidationResult {
  ok: boolean;
  reason?: string;
  submission?: {
    gameSlug: GameSlug;
    playerName: string;
    score: number;
    sessionDurationMs?: number;
    metrics?: Record<string, number>;
  };
}
