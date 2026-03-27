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
  id: string;
  name: string;
  color: string;
  cellCount: number;
  footprint: string;
  cells: BlockCell[];
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
  selection: BlockJamSelectionState | null;
}

export interface BlockJamSelectionState {
  pieceIndex: number;
  pieceName: string;
  row: number;
  col: number;
  valid: boolean;
  inputMode: 'cursor' | 'drag';
}

export type BlockJamAutomationScenario =
  | 'default'
  | 'start'
  | 'midgame'
  | 'game-over';

export interface BlockJamAutomationQueuePiece {
  index: number;
  token: string;
  id: string;
  name: string;
  color: string;
  width: number;
  height: number;
  cells: BlockCell[];
}

export interface BlockJamAutomationCursorState {
  row: number;
  col: number;
  pieceIndex: number;
  pieceName: string;
  valid: boolean;
}

export interface BlockJamAutomationDragState {
  pieceIndex: number;
  pieceName: string;
  row: number | null;
  col: number | null;
  valid: boolean;
}

export interface BlockJamAutomationState {
  schemaVersion: 1;
  game: 'block-jam-blitz';
  scenario: BlockJamAutomationScenario;
  mode: 'running' | 'paused' | 'game-over';
  coordinateSystem: {
    origin: 'top-left';
    rowAxis: 'down';
    colAxis: 'right';
    boardSize: number;
    cellUnit: 'board-cell';
  };
  score: number;
  combo: number;
  linesCleared: number;
  moveCount: number;
  sessionDurationMs: number;
  statusMessage: string;
  board: string[];
  queue: BlockJamAutomationQueuePiece[];
  availablePlacements: Array<{
    pieceIndex: number;
    count: number;
  }>;
  cursor: BlockJamAutomationCursorState | null;
  drag: BlockJamAutomationDragState | null;
  isGameOver: boolean;
}

export interface BlockJamSceneController {
  getSnapshot: () => BlockJamSnapshot;
  getAutomationState: () => BlockJamAutomationState;
  advanceTime: (ms: number) => void;
}
