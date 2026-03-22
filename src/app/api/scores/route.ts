import { NextRequest, NextResponse } from 'next/server';

import { getGameMetadata, isGameSlug } from '@/features/games';
import {
  scoreSubmissionSchema,
  SCORE_RULES,
  validateScoreSubmission,
} from '@/server/scores';

export async function GET(request: NextRequest) {
  const game = request.nextUrl.searchParams.get('game');

  if (!game || !isGameSlug(game)) {
    return NextResponse.json(
      { ok: false, error: 'A valid game slug is required.' },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    game,
    title: getGameMetadata(game).name,
    leaderboard: [],
    scoreRule: SCORE_RULES[game],
    scaffold: true,
  });
}

export async function POST(request: NextRequest) {
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

  return NextResponse.json(
    {
      ok: true,
      persisted: false,
      submission: validation.submission,
      message: 'Score submission scaffolded. Connect Supabase persistence next.',
    },
    { status: 202 },
  );
}
