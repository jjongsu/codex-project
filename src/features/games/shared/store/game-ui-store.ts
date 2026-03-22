'use client';

import { create } from 'zustand';

interface GameUiState {
  isPaused: boolean;
  isMuted: boolean;
  setPaused: (value: boolean) => void;
  toggleMuted: () => void;
  reset: () => void;
}

const initialState = {
  isPaused: false,
  isMuted: false,
};

export const useGameUiStore = create<GameUiState>((set) => ({
  ...initialState,
  setPaused: (value) => set({ isPaused: value }),
  toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
  reset: () => set(initialState),
}));
