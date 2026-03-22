import { SCORE_RULES } from '@/server/scores/rules';
import {
  type ScoreSubmissionInput,
  type ScoreValidationResult,
} from '@/server/scores/types';
import {
  isValidPlayerName,
  normalizePlayerName,
} from '@/server/scores/player-name';

export function validateScoreSubmission(
  submission: ScoreSubmissionInput,
): ScoreValidationResult {
  const normalizedPlayerName = normalizePlayerName(submission.playerName);

  if (!isValidPlayerName(normalizedPlayerName)) {
    return {
      ok: false,
      reason: 'Player name must be 1 to 3 uppercase English letters.',
    };
  }

  const rule = SCORE_RULES[submission.gameSlug];

  if (submission.score < rule.minScore) {
    return {
      ok: false,
      reason: 'Score must be a non-negative integer.',
    };
  }

  if (submission.score > rule.softMaxScore) {
    return {
      ok: false,
      reason: 'Score is above the current soft limit for this game.',
    };
  }

  if (
    rule.minSessionDurationMs &&
    submission.sessionDurationMs &&
    submission.sessionDurationMs < rule.minSessionDurationMs &&
    submission.score > rule.softMaxScore * 0.2
  ) {
    return {
      ok: false,
      reason: 'Score is too high for the reported session duration.',
    };
  }

  return {
    ok: true,
    submission: {
      ...submission,
      playerName: normalizedPlayerName,
    },
  };
}
