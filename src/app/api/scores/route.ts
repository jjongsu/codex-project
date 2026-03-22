import { NextRequest, NextResponse } from 'next/server';

import { getGameMetadata, isGameSlug } from '@/features/games';
import {
  insertHighScore,
  listHighScores,
  scoreSubmissionSchema,
  SCORE_RULES,
  validateScoreSubmission,
} from '@/server/scores';
import { isSupabaseServerConfigured } from '@/server/supabase/env';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get('game');
  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? '10');
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(25, Math.max(1, Math.trunc(requestedLimit)))
    : 10;

  if (!game || !isGameSlug(game)) {
    return NextResponse.json(
      { ok: false, error: 'A valid game slug is required.' },
      { status: 400 },
    );
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local.',
      },
      { status: 503 },
    );
  }

  try {
    const leaderboard = await listHighScores(game, limit);

    return NextResponse.json({
      ok: true,
      game,
      title: getGameMetadata(game).name,
      leaderboard,
      scoreRule: SCORE_RULES[game],
      scaffold: false,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load the leaderboard from Supabase.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local.',
      },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = scoreSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid score submission payload.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const validation = validateScoreSubmission(parsed.data);

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.reason,
      },
      { status: 400 },
    );
  }

  if (!validation.submission) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Validated score submission is missing normalized payload.',
      },
      { status: 500 },
    );
  }

  try {
    const savedScore = await insertHighScore({
      gameSlug: validation.submission.gameSlug,
      playerName: validation.submission.playerName,
      score: validation.submission.score,
    });

    return NextResponse.json(
      {
        ok: true,
        persisted: true,
        submission: validation.submission,
        savedScore,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save the score to Supabase.',
      },
      { status: 500 },
    );
  }
}
