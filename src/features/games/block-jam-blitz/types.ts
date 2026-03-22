export interface BlockCell {
  x: number;
  y: number;
}

export interface BlockJamShapeDefinition {
  id: string;
  name: string;
  color: string;
  cells: BlockCell[];
}

export interface BlockJamQueuePiece {
  token: string;
  id: string;
  name: string;
  color: string;
  cells: BlockCell[];
  width: number;
  height: number;
}

export interface BlockJamQueuePreview {
  token: string;
  name: string;
  color: string;
  cellCount: number;
  footprint: string;
}

export interface BlockJamSnapshot {
  score: number;
  combo: number;
  linesCleared: number;
  moveCount: number;
  sessionDurationMs: number;
  queue: BlockJamQueuePreview[];
  isGameOver: boolean;
  lastClearCount: number;
  statusMessage: string;
}
