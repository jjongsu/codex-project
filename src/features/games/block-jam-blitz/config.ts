import type {
  BlockJamQueuePiece,
  BlockJamQueuePreview,
  BlockJamShapeDefinition,
} from '@/features/games/block-jam-blitz/types';

export const BOARD_SIZE = 8;
export const BOARD_CELL_SIZE = 48;
export const BOARD_ORIGIN = {
  x: 68,
  y: 68,
};

export const SCENE_SIZE = {
  width: 520,
  height: 760,
};

export const QUEUE_LAYOUT = {
  x: 34,
  y: 502,
  slotWidth: 144,
  slotHeight: 172,
  gap: 10,
};

const SHAPE_LIBRARY: BlockJamShapeDefinition[] = [
  {
    id: 'dot',
    name: 'Dot',
    color: '#17c9b2',
    cells: [{ x: 0, y: 0 }],
  },
  {
    id: 'bar-3-h',
    name: 'Bar 3',
    color: '#ff9b54',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  },
  {
    id: 'bar-3-v',
    name: 'Bar 3 Tall',
    color: '#ff9b54',
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
  },
  {
    id: 'bar-4-h',
    name: 'Bar 4',
    color: '#f43f5e',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
  },
  {
    id: 'bar-4-v',
    name: 'Bar 4 Tall',
    color: '#f43f5e',
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ],
  },
  {
    id: 'square-2',
    name: 'Square',
    color: '#facc15',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'l-3',
    name: 'Mini L',
    color: '#0ea5e9',
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'j-3',
    name: 'Mini J',
    color: '#0ea5e9',
    cells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'l-4',
    name: 'L 4',
    color: '#8b5cf6',
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  {
    id: 'j-4',
    name: 'J 4',
    color: '#8b5cf6',
    cells: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
  },
  {
    id: 't-4',
    name: 'T',
    color: '#6366f1',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 's-4',
    name: 'S',
    color: '#22c55e',
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
  },
  {
    id: 'z-4',
    name: 'Z',
    color: '#ef4444',
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
];

export const BLOCK_JAM_SHAPE_IDS = SHAPE_LIBRARY.map((shape) => shape.id);

const SHAPE_LIBRARY_BY_ID = Object.fromEntries(
  SHAPE_LIBRARY.map((shape) => [shape.id, shape]),
) as Record<string, BlockJamShapeDefinition>;

let tokenCounter = 0;

function getPieceBounds(cells: BlockJamShapeDefinition['cells']) {
  const width = Math.max(...cells.map((cell) => cell.x)) + 1;
  const height = Math.max(...cells.map((cell) => cell.y)) + 1;

  return { width, height };
}

export function createRandomQueuePiece(): BlockJamQueuePiece {
  const shape = SHAPE_LIBRARY[Math.floor(Math.random() * SHAPE_LIBRARY.length)];
  return createQueuePieceFromDefinition(shape);
}

function createQueuePieceFromDefinition(
  shape: BlockJamShapeDefinition,
): BlockJamQueuePiece {
  const bounds = getPieceBounds(shape.cells);

  return {
    token: `${shape.id}-${tokenCounter++}`,
    id: shape.id,
    name: shape.name,
    color: shape.color,
    cells: shape.cells.map((cell) => ({ ...cell })),
    width: bounds.width,
    height: bounds.height,
  };
}

export function createQueuePieceFromShapeId(shapeId: string): BlockJamQueuePiece {
  const shape = SHAPE_LIBRARY_BY_ID[shapeId];

  if (!shape) {
    throw new Error(`Unknown Block Jam shape id: ${shapeId}`);
  }

  return createQueuePieceFromDefinition(shape);
}

export function createInitialQueue(size = 3): BlockJamQueuePiece[] {
  return Array.from({ length: size }, () => createRandomQueuePiece());
}

export function toQueuePreview(piece: BlockJamQueuePiece): BlockJamQueuePreview {
  return {
    token: piece.token,
    id: piece.id,
    name: piece.name,
    color: piece.color,
    cellCount: piece.cells.length,
    footprint: `${piece.width}x${piece.height}`,
    cells: piece.cells.map((cell) => ({ ...cell })),
  };
}

export function hexToNumber(color: string): number {
  return Number.parseInt(color.replace('#', ''), 16);
}
