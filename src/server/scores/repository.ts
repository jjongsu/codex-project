import type { GameSlug } from '@/features/games';
import { createSupabaseServerClient } from '@/server/supabase/client';

interface HighScoreRow {
  id: string;
  game_slug: GameSlug;
  player_name: string;
  score: number;
  created_at: string;
}

export interface HighScoreEntry {
  id: string;
  gameSlug: GameSlug;
  playerName: string;
  score: number;
  createdAt: string;
}

interface InsertHighScoreInput {
  gameSlug: GameSlug;
  playerName: string;
  score: number;
}

const HIGH_SCORE_COLUMNS = 'id, game_slug, player_name, score, created_at';

function mapHighScoreRow(row: HighScoreRow): HighScoreEntry {
  return {
    id: row.id,
    gameSlug: row.game_slug,
    playerName: row.player_name,
    score: row.score,
    createdAt: row.created_at,
  };
}

export async function listHighScores(
  gameSlug: GameSlug,
  limit = 10,
): Promise<HighScoreEntry[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('high_scores')
    .select(HIGH_SCORE_COLUMNS)
    .eq('game_slug', gameSlug)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data satisfies HighScoreRow[]).map(mapHighScoreRow);
}

export async function insertHighScore(
  input: InsertHighScoreInput,
): Promise<HighScoreEntry> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('high_scores')
    .insert({
      game_slug: input.gameSlug,
      player_name: input.playerName,
      score: input.score,
    })
    .select(HIGH_SCORE_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapHighScoreRow(data satisfies HighScoreRow);
}
