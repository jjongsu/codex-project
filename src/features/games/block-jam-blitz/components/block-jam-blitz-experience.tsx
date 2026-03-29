'use client';

import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getGameScoreApiHref,
  type GameMetadata,
  type GameSlug,
} from '@/features/games';
import { BlockJamBlitzCanvas } from '@/features/games/block-jam-blitz/components/block-jam-blitz-canvas';
import type {
  BlockJamQueuePreview,
  BlockJamSnapshot,
} from '@/features/games/block-jam-blitz/types';
import { useGameUiStore } from '@/features/games/shared/store/game-ui-store';

interface LeaderboardEntry {
  id: string;
  gameSlug: GameSlug;
  playerName: string;
  score: number;
  createdAt: string;
}

interface SubmitState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  message: string | null;
}

const INITIAL_SNAPSHOT: BlockJamSnapshot = {
  score: 0,
  combo: 0,
  linesCleared: 0,
  moveCount: 0,
  sessionDurationMs: 0,
  queue: [],
  isGameOver: false,
  lastClearCount: 0,
  statusMessage: 'Drag one of the three blocks onto the board.',
  selection: null,
};

interface BlockJamBlitzExperienceProps {
  game: GameMetadata;
}

function formatLeaderboardDate(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function QueuePreviewCard({ piece }: { piece: BlockJamQueuePreview }) {
  return (
    <div className="rounded-[22px] border border-black/8 bg-[color:var(--color-background-soft)] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-black">{piece.name}</p>
          <p className="mt-1 text-xs text-black/48">{piece.footprint}</p>
        </div>
        <span
          className="inline-flex h-10 min-w-10 items-center justify-center rounded-2xl px-3 text-xs font-semibold text-white"
          style={{ backgroundColor: piece.color }}
        >
          {piece.cellCount}
        </span>
      </div>
    </div>
  );
}

export function BlockJamBlitzExperience({
  game,
}: BlockJamBlitzExperienceProps) {
  const [sessionKey, setSessionKey] = useState(0);
  const [snapshot, setSnapshot] = useState<BlockJamSnapshot>(INITIAL_SNAPSHOT);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [leaderboardMessage, setLeaderboardMessage] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: 'idle',
    message: null,
  });
  const [isAutomationMode, setIsAutomationMode] = useState(false);
  const [prefersTouchUi, setPrefersTouchUi] = useState(false);

  const isPaused = useGameUiStore((state) => state.isPaused);
  const isMuted = useGameUiStore((state) => state.isMuted);
  const setPaused = useGameUiStore((state) => state.setPaused);
  const toggleMuted = useGameUiStore((state) => state.toggleMuted);
  const resetUiState = useGameUiStore((state) => state.reset);

  const scoreApiHref = useMemo(
    () => getGameScoreApiHref(game.slug),
    [game.slug],
  );

  useEffect(() => {
    const automationEnabled =
      new URL(window.location.href).searchParams.get('automation') === '1';
    setIsAutomationMode(automationEnabled);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    const updatePointerMode = () => {
      setPrefersTouchUi(mediaQuery.matches || navigator.maxTouchPoints > 0);
    };

    updatePointerMode();
    mediaQuery.addEventListener('change', updatePointerMode);

    return () => {
      mediaQuery.removeEventListener('change', updatePointerMode);
    };
  }, []);

  useEffect(() => {
    if (!isAutomationMode) {
      delete document.body.dataset.gameAutomation;
      return;
    }

    document.body.dataset.gameAutomation = game.slug;

    return () => {
      delete document.body.dataset.gameAutomation;
    };
  }, [game.slug, isAutomationMode]);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardStatus('loading');
    setLeaderboardMessage(null);

    try {
      const response = await fetch(scoreApiHref, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        leaderboard?: LeaderboardEntry[];
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Failed to load the leaderboard.');
      }

      startTransition(() => {
        setLeaderboard(payload.leaderboard ?? []);
        setLeaderboardStatus('ready');
      });
    } catch (error) {
      setLeaderboardStatus('error');
      setLeaderboardMessage(
        error instanceof Error ? error.message : 'Failed to load the leaderboard.',
      );
    }
  }, [scoreApiHref]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  const canSubmit =
    snapshot.isGameOver &&
    snapshot.score > 0 &&
    playerName.length >= 1 &&
    playerName.length <= 3 &&
    submitState.status !== 'submitting';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitState({
      status: 'submitting',
      message: 'Saving score...',
    });

    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameSlug: game.slug,
          playerName,
          score: snapshot.score,
          sessionDurationMs: snapshot.sessionDurationMs,
        }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? 'Score save failed.');
      }

      setSubmitState({
        status: 'success',
        message: 'Score saved to Supabase.',
      });
      setPlayerName('');
      void loadLeaderboard();
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Score save failed.',
      });
    }
  }

  function handleRestart() {
    resetUiState();
    setSnapshot(INITIAL_SNAPSHOT);
    setSubmitState({
      status: 'idle',
      message: null,
    });
    setPlayerName('');
    setSessionKey((current) => current + 1);
  }

  const selectionLabel = snapshot.selection
    ? `${snapshot.selection.pieceName} · row ${snapshot.selection.row + 1}, col ${snapshot.selection.col + 1}`
    : 'Pick a piece from the queue and place it on the board.';
  const selectionStateLabel = snapshot.selection
    ? snapshot.selection.valid
      ? 'Placement ready'
      : 'Blocked'
    : 'Waiting';
  const selectionStateTone = snapshot.selection
    ? snapshot.selection.valid
      ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-strong)]'
      : 'bg-red-50 text-red-700'
    : 'bg-black/5 text-black/60';
  const keyboardHint = 'Keyboard: Arrow keys move, A/B switch pieces, Enter places.';
  const touchHint =
    'Touch: Hold a block, keep your thumb below the outline, release on teal.';
  const activeControlHint = prefersTouchUi ? touchHint : keyboardHint;

  const submitCard = (
    <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
        Submit Score
      </p>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-[22px] bg-[color:var(--color-background-soft)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-black/45">Final Score</p>
          <p className="mt-2 text-3xl font-semibold text-black">{snapshot.score}</p>
        </div>

        <label className="block space-y-2" htmlFor="block-jam-player-name">
          <span className="text-sm font-medium text-black">Player Name</span>
          <input
            id="block-jam-player-name"
            name="playerName"
            value={playerName}
            onChange={(event) => {
              setPlayerName(
                event.currentTarget.value
                  .toUpperCase()
                  .replace(/[^A-Z]/g, '')
                  .slice(0, 3),
              );
            }}
            placeholder="AAA"
            maxLength={3}
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-lg font-semibold uppercase tracking-[0.3em] text-black outline-none transition focus:border-[color:var(--color-accent)]"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white transition enabled:hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-black/25"
        >
          {submitState.status === 'submitting' ? 'Saving...' : 'Save To Leaderboard'}
        </button>

        <p className="text-xs leading-5 text-black/55">
          {snapshot.isGameOver
            ? 'Game over. Enter 1 to 3 uppercase letters and save the run.'
            : 'The form unlocks when the board has no valid placements left.'}
        </p>

        {submitState.message ? (
          <p
            className={`text-sm ${
              submitState.status === 'error'
                ? 'text-red-600'
                : 'text-[color:var(--color-accent-strong)]'
            }`}
          >
            {submitState.message}
          </p>
        ) : null}
      </form>
    </div>
  );

  return (
    <div
      className={
        isAutomationMode
          ? 'mx-auto flex w-full max-w-[760px] flex-col gap-5'
          : 'grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]'
      }
    >
      <section className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div
          className={`border-b border-black/10 bg-[color:var(--color-background-soft)] ${
            isAutomationMode ? 'px-5 py-4 sm:px-6' : 'px-6 py-5'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                {isAutomationMode ? 'Automation Focus' : 'Live Prototype'}
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-black">{game.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setPaused(!isPaused)}
                className="min-w-[112px] rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={toggleMuted}
                className="min-w-[112px] rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="min-w-[132px] rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-strong)]"
              >
                Restart Run
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-[22px] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Score</p>
              <p className="mt-2 text-2xl font-semibold text-black">{snapshot.score}</p>
            </div>
            <div className="rounded-[22px] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Combo</p>
              <p className="mt-2 text-2xl font-semibold text-black">{snapshot.combo}</p>
            </div>
            <div className="rounded-[22px] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Lines</p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {snapshot.linesCleared}
              </p>
            </div>
            <div className="rounded-[22px] bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-black/45">Moves</p>
              <p className="mt-2 text-2xl font-semibold text-black">{snapshot.moveCount}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${selectionStateTone}`}
            >
              {selectionStateLabel}
            </span>
            <p className="text-sm text-black/70">{selectionLabel}</p>
          </div>

          {isAutomationMode ? (
            <div className="mt-3 rounded-[20px] bg-white/75 px-4 py-3 text-sm text-black/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                Control Hint
              </p>
              <p className="mt-2 leading-6">{activeControlHint}</p>
            </div>
          ) : null}
        </div>

        <div className={`space-y-4 ${isAutomationMode ? 'p-4 sm:p-5' : 'p-6'}`}>
          <BlockJamBlitzCanvas
            key={sessionKey}
            sessionKey={sessionKey}
            isPaused={isPaused}
            isAutomationMode={isAutomationMode}
            onSnapshot={setSnapshot}
          />

          <div className="rounded-[24px] bg-[color:var(--color-background-soft)] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
              Session Status
            </p>
            <p className="mt-2 text-sm leading-6 text-black/70">
              {snapshot.statusMessage}
            </p>
            <p className="mt-3 text-xs text-black/50">
              Session length {Math.floor(snapshot.sessionDurationMs / 1000)}s
            </p>
          </div>

          {snapshot.isGameOver ? (
            <div className="rounded-[24px] border border-[color:var(--color-accent)]/25 bg-[linear-gradient(135deg,rgba(23,201,178,0.12),rgba(255,255,255,0.95))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                Run Locked
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold text-black">{snapshot.score}</p>
                  <p className="mt-1 text-sm text-black/65">
                    Enter 1 to 3 initials and save the run to the leaderboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-strong)]"
                >
                  Start Fresh Run
                </button>
              </div>
            </div>
          ) : null}

          {snapshot.isGameOver && !isAutomationMode ? (
            <div className="lg:hidden">{submitCard}</div>
          ) : null}

          {isAutomationMode ? (
            <div className="rounded-[24px] border border-black/10 bg-white/90 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                    Queue
                  </p>
                  <p className="mt-1 text-sm text-black/55">
                    Keep the next three shapes readable while testing placement feel.
                  </p>
                </div>
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/60">
                  Canvas focus mode
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {snapshot.queue.map((piece, index) => (
                  <div
                    key={piece.token}
                    className={`rounded-[22px] border px-3 py-3 ${
                      snapshot.selection?.pieceIndex === index
                        ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]/70'
                        : 'border-black/8 bg-[color:var(--color-background-soft)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-black">{piece.name}</p>
                    <p className="mt-1 text-xs text-black/48">{piece.footprint}</p>
                    <p className="mt-3 text-xs font-medium text-black/55">
                      {piece.cellCount} cells
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {isAutomationMode ? null : (
        <aside className="space-y-4">
        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Queue
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {snapshot.queue.length > 0 ? (
              snapshot.queue.map((piece, index) => (
                <div
                  key={piece.token}
                  className={`rounded-[24px] ${
                    snapshot.selection?.pieceIndex === index
                      ? 'ring-2 ring-[color:var(--color-accent)] ring-offset-2 ring-offset-white'
                      : ''
                  }`}
                >
                  <QueuePreviewCard piece={piece} />
                </div>
              ))
            ) : (
              <p className="text-sm text-black/55">
                Queue data will appear once the scene is ready.
              </p>
            )}
          </div>
        </div>

        <div className="hidden lg:block">{submitCard}</div>

        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
                Leaderboard
              </p>
              <p className="mt-1 text-sm text-black/55">Top scores from Supabase</p>
            </div>
            <button
              type="button"
              onClick={() => void loadLeaderboard()}
              className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black transition hover:bg-black/5"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {leaderboardStatus === 'loading' ? (
              <p className="text-sm text-black/55">Loading leaderboard...</p>
            ) : null}

            {leaderboardStatus === 'error' ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {leaderboardMessage}
              </p>
            ) : null}

            {leaderboardStatus === 'ready' && leaderboard.length === 0 ? (
              <p className="text-sm text-black/55">
                No scores saved yet. The first clear run can claim rank one.
              </p>
            ) : null}

            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-[22px] bg-[color:var(--color-background-soft)] px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-black">{entry.playerName}</p>
                    <p className="mt-1 text-xs text-black/48">
                      {formatLeaderboardDate(entry.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-black">{entry.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent-strong)]">
            Score Rule
          </p>
          <p className="mt-3 text-sm font-medium text-black">
            Primary: {game.scoreRule.primaryMetric}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-black/68">
            {game.scoreRule.bonuses.map((bonus) => (
              <li key={bonus}>- {bonus}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-5 text-black/55">
            {game.scoreRule.validationHint}
          </p>
        </div>
        </aside>
      )}
    </div>
  );
}
