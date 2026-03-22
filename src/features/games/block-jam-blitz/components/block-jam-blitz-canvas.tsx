'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { Game } from 'phaser';

import type { BlockJamSnapshot } from '@/features/games/block-jam-blitz/types';

interface BlockJamBlitzCanvasProps {
  sessionKey: number;
  isPaused: boolean;
  onSnapshot: (snapshot: BlockJamSnapshot) => void;
}

export function BlockJamBlitzCanvas({
  sessionKey,
  isPaused,
  onSnapshot,
}: BlockJamBlitzCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const handleSnapshot = useEffectEvent(onSnapshot);

  useEffect(() => {
    let isDisposed = false;
    let gameInstance: Game | null = null;
    const mountNode = mountRef.current;

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

        const scene = createBlockJamBlitzScene(Phaser, {
          onSnapshot: (snapshot) => {
            handleSnapshot(snapshot);
          },
        });

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
        className="mx-auto aspect-[13/19] w-full max-w-[560px] overflow-hidden rounded-[28px] bg-[color:var(--color-background-soft)]"
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
