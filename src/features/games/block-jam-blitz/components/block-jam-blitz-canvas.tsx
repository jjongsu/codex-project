'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Game } from 'phaser';

import type {
  BlockJamAutomationScenario,
  BlockJamAutomationState,
  BlockJamSceneController,
  BlockJamSnapshot,
} from '@/features/games/block-jam-blitz/types';

interface BlockJamBlitzCanvasProps {
  sessionKey: number;
  isPaused: boolean;
  isAutomationMode: boolean;
  onSnapshot: (snapshot: BlockJamSnapshot) => void;
}

export function BlockJamBlitzCanvas({
  sessionKey,
  isPaused,
  isAutomationMode,
  onSnapshot,
}: BlockJamBlitzCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<BlockJamSceneController | null>(null);
  const latestSnapshotRef = useRef<BlockJamSnapshot | null>(null);
  const isPausedRef = useRef(isPaused);
  const [bootError, setBootError] = useState<string | null>(null);
  const handleSnapshot = useEffectEvent(onSnapshot);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    let isDisposed = false;
    let gameInstance: Game | null = null;
    const mountNode = mountRef.current;

    function getAutomationParams(): {
      automationEnabled: boolean;
      automationScenario: BlockJamAutomationScenario;
    } {
      if (typeof window === 'undefined') {
        return {
          automationEnabled: false,
          automationScenario: 'default',
        };
      }

      const searchParams = new URL(window.location.href).searchParams;
      const automationEnabled = searchParams.get('automation') === '1';
      const scenario = searchParams.get('scenario');

      if (
        scenario === 'start' ||
        scenario === 'midgame' ||
        scenario === 'game-over'
      ) {
        return {
          automationEnabled,
          automationScenario: scenario,
        };
      }

      return {
        automationEnabled,
        automationScenario: automationEnabled ? 'start' : 'default',
      };
    }

    function serializeAutomationState(state: BlockJamAutomationState) {
      return JSON.stringify({
        ...state,
        mode: isPausedRef.current ? 'paused' : state.mode,
      });
    }

    async function mountGame() {
      if (!mountNode) {
        return;
      }

      try {
        const [Phaser, { createBlockJamBlitzScene }] = await Promise.all([
          import('phaser'),
          import('@/features/games/block-jam-blitz/scene/create-block-jam-blitz-scene'),
        ]);

        if (isDisposed) {
          return;
        }

        const automationParams = getAutomationParams();
        const scene = createBlockJamBlitzScene(Phaser, {
          onSnapshot: (snapshot) => {
            latestSnapshotRef.current = snapshot;
            handleSnapshot(snapshot);
          },
        }, automationParams);
        controllerRef.current = scene;

        const renderHook = () => {
          const controller = controllerRef.current;

          if (!controller) {
            return JSON.stringify({
              schemaVersion: 1,
              game: 'block-jam-blitz',
              mode: 'running',
              statusMessage: 'Scene controller not ready yet.',
            });
          }

          return serializeAutomationState(controller.getAutomationState());
        };

        const advanceHook = (ms: number) => {
          const controller = controllerRef.current;

          if (!controller) {
            return;
          }

          controller.advanceTime(ms);
          const snapshot = controller.getSnapshot();
          latestSnapshotRef.current = snapshot;
          handleSnapshot(snapshot);
        };

        window.render_game_to_text = renderHook;
        window.advanceTime = advanceHook;

        gameInstance = new Phaser.Game({
          type: Phaser.AUTO,
          width: 520,
          height: 760,
          parent: mountNode,
          backgroundColor: '#fffaf1',
          scene: [scene],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          disableContextMenu: true,
        });
      } catch (error) {
        setBootError(
          error instanceof Error ? error.message : 'Failed to initialize Phaser.',
        );
      }
    }

    void mountGame();

    return () => {
      isDisposed = true;
      controllerRef.current = null;

      if (window.render_game_to_text) {
        delete window.render_game_to_text;
      }

      if (window.advanceTime) {
        delete window.advanceTime;
      }

      gameInstance?.destroy(true);

      if (mountNode) {
        mountNode.innerHTML = '';
      }
    };
  }, [sessionKey]);

  return (
    <div className="relative">
      <div
        ref={mountRef}
        id="block-jam-blitz-surface"
        data-testid="block-jam-blitz-surface"
        tabIndex={0}
        role="application"
        aria-label="Block Jam Blitz game board"
        className={`mx-auto aspect-[13/19] w-full max-w-[560px] overflow-hidden rounded-[28px] bg-[color:var(--color-background-soft)] ${
          isAutomationMode
            ? 'ring-1 ring-black/8 shadow-[0_28px_80px_rgba(15,23,42,0.14)]'
            : ''
        }`}
      />

      {isPaused ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-black/35 backdrop-blur-sm">
          <div className="rounded-[24px] bg-white/92 px-6 py-5 text-center shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
              Paused
            </p>
            <p className="mt-2 text-sm text-black/70">
              Resume to place your next block.
            </p>
          </div>
        </div>
      ) : null}

      {bootError ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bootError}
        </div>
      ) : null}
    </div>
  );
}
