import type * as PhaserModuleType from 'phaser';

import {
  BOARD_CELL_SIZE,
  BOARD_ORIGIN,
  BOARD_SIZE,
  QUEUE_LAYOUT,
  SCENE_SIZE,
  createInitialQueue,
  createRandomQueuePiece,
  hexToNumber,
  toQueuePreview,
} from '@/features/games/block-jam-blitz/config';
import type {
  BlockJamQueuePiece,
  BlockJamSnapshot,
} from '@/features/games/block-jam-blitz/types';

type PhaserModule = typeof PhaserModuleType;

interface BlockJamSceneCallbacks {
  onSnapshot: (snapshot: BlockJamSnapshot) => void;
}

interface DragState {
  pieceIndex: number;
  piece: BlockJamQueuePiece;
  offsetX: number;
  offsetY: number;
  preview: any;
  source: any;
  candidateRow: number | null;
  candidateCol: number | null;
  valid: boolean;
}

type BoardState = Array<Array<string | null>>;

function createBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
}

function getSessionDurationMs(startedAt: number, endedAt: number | null): number {
  return Math.max(0, (endedAt ?? Date.now()) - startedAt);
}

export function createBlockJamBlitzScene(
  Phaser: PhaserModule,
  callbacks: BlockJamSceneCallbacks,
) {
  return new (class BlockJamBlitzScene extends Phaser.Scene {
    private board: BoardState = createBoard();

    private boardGraphics!: any;

    private ghostGraphics!: any;

    private queueSlotBackgrounds: any[] = [];

    private queueDisplays: any[] = [];

    private score = 0;

    private combo = 0;

    private linesCleared = 0;

    private moveCount = 0;

    private lastClearCount = 0;

    private isGameOver = false;

    private startedAt = Date.now();

    private endedAt: number | null = null;

    private statusMessage = 'Drag one of the three blocks onto the board.';

    private queue = createInitialQueue();

    private dragState: DragState | null = null;

    constructor() {
      super('block-jam-blitz');
    }

    create() {
      this.boardGraphics = this.add.graphics();
      this.ghostGraphics = this.add.graphics();

      this.drawBackdrop();
      this.drawBoard();
      this.buildQueueArea();
      this.rebuildQueueDisplays();
      this.registerInput();
      this.emitSnapshot();
    }

    private drawBackdrop() {
      const backdrop = this.add.graphics();
      backdrop.fillStyle(0xfffcf5, 1);
      backdrop.fillRoundedRect(14, 14, SCENE_SIZE.width - 28, SCENE_SIZE.height - 28, 32);
      backdrop.lineStyle(2, 0xf1e8d8, 1);
      backdrop.strokeRoundedRect(14, 14, SCENE_SIZE.width - 28, SCENE_SIZE.height - 28, 32);

      const heading = this.add.text(34, 20, 'Block Jam Blitz', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '22px',
        color: '#111111',
        fontStyle: '700',
      });
      heading.setDepth(5);

      const subheading = this.add.text(
        34,
        52,
        'Place blocks, clear lines, and stretch the combo.',
        {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '14px',
          color: '#5d5242',
        },
      );
      subheading.setDepth(5);
    }

    private drawBoard() {
      this.boardGraphics.clear();

      this.boardGraphics.fillStyle(0xf8f1e4, 1);
      this.boardGraphics.fillRoundedRect(
        BOARD_ORIGIN.x - 12,
        BOARD_ORIGIN.y - 12,
        BOARD_SIZE * BOARD_CELL_SIZE + 24,
        BOARD_SIZE * BOARD_CELL_SIZE + 24,
        28,
      );

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          const x = BOARD_ORIGIN.x + col * BOARD_CELL_SIZE;
          const y = BOARD_ORIGIN.y + row * BOARD_CELL_SIZE;
          const cellColor = this.board[row][col];

          this.boardGraphics.fillStyle(
            cellColor ? hexToNumber(cellColor) : 0xfffdf7,
            cellColor ? 0.95 : 1,
          );
          this.boardGraphics.fillRoundedRect(
            x + 2,
            y + 2,
            BOARD_CELL_SIZE - 4,
            BOARD_CELL_SIZE - 4,
            12,
          );
          this.boardGraphics.lineStyle(1, 0xe5dccb, 1);
          this.boardGraphics.strokeRoundedRect(
            x + 2,
            y + 2,
            BOARD_CELL_SIZE - 4,
            BOARD_CELL_SIZE - 4,
            12,
          );
        }
      }
    }

    private buildQueueArea() {
      for (let index = 0; index < 3; index += 1) {
        const x = QUEUE_LAYOUT.x + index * (QUEUE_LAYOUT.slotWidth + QUEUE_LAYOUT.gap);
        const y = QUEUE_LAYOUT.y;
        const graphics = this.add.graphics();
        graphics.fillStyle(0xfff8ea, 1);
        graphics.fillRoundedRect(x, y, QUEUE_LAYOUT.slotWidth, QUEUE_LAYOUT.slotHeight, 24);
        graphics.lineStyle(1, 0xe9dcc4, 1);
        graphics.strokeRoundedRect(x, y, QUEUE_LAYOUT.slotWidth, QUEUE_LAYOUT.slotHeight, 24);
        this.queueSlotBackgrounds.push(graphics);
      }

      this.add.text(36, QUEUE_LAYOUT.y - 28, 'Queue', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '14px',
        color: '#5d5242',
        fontStyle: '700',
      });
    }

    private rebuildQueueDisplays() {
      this.queueDisplays.forEach((display) => display.destroy());
      this.queueDisplays = [];

      this.queue.forEach((piece, index) => {
        const slotX = QUEUE_LAYOUT.x + index * (QUEUE_LAYOUT.slotWidth + QUEUE_LAYOUT.gap);
        const slotY = QUEUE_LAYOUT.y;
        const previewScale = 22;
        const pieceWidth = piece.width * previewScale;
        const pieceHeight = piece.height * previewScale;
        const pieceX = slotX + (QUEUE_LAYOUT.slotWidth - pieceWidth) / 2;
        const pieceY = slotY + 32 + (QUEUE_LAYOUT.slotHeight - 56 - pieceHeight) / 2;
        const display = this.createPieceDisplay(piece, pieceX, pieceY, previewScale, true);

        const label = this.add.text(slotX + 16, slotY + 16, piece.name, {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '12px',
          color: '#433c32',
          fontStyle: '700',
        });

        const footprint = this.add.text(
          slotX + 16,
          slotY + QUEUE_LAYOUT.slotHeight - 24,
          `${piece.width}x${piece.height} / ${piece.cells.length} cells`,
          {
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '11px',
            color: '#7d6f5d',
          },
        );

        display.setData('pieceIndex', index);
        display.setData('pieceToken', piece.token);
        display.on(
          'pointerdown',
          (pointer: any) => {
            this.startDrag(index, pointer, display, piece);
          },
          this,
        );

        this.queueDisplays.push(display, label, footprint);
      });
    }

    private createPieceDisplay(
      piece: BlockJamQueuePiece,
      x: number,
      y: number,
      cellSize: number,
      interactive: boolean,
    ) {
      const container = this.add.container(x, y);

      piece.cells.forEach((cell) => {
        const rect = this.add.rectangle(
          cell.x * cellSize + cellSize / 2,
          cell.y * cellSize + cellSize / 2,
          cellSize - 3,
          cellSize - 3,
          hexToNumber(piece.color),
        );
        rect.setStrokeStyle(2, 0xfffcf7, 0.55);
        container.add(rect);
      });

      if (interactive) {
        container.setSize(piece.width * cellSize, piece.height * cellSize);
        container.setInteractive(
          new Phaser.Geom.Rectangle(
            0,
            0,
            piece.width * cellSize,
            piece.height * cellSize,
          ),
          Phaser.Geom.Rectangle.Contains,
        );
      }

      return container;
    }

    private registerInput() {
      this.input.on('pointermove', this.handlePointerMove, this);
      this.input.on('pointerup', this.handlePointerUp, this);
      this.input.on('pointerupoutside', this.handlePointerUp, this);
    }

    private startDrag(
      pieceIndex: number,
      pointer: any,
      sourceDisplay: any,
      piece: BlockJamQueuePiece,
    ) {
      if (this.isGameOver || this.dragState) {
        return;
      }

      sourceDisplay.setAlpha(0.35);

      const preview = this.createPieceDisplay(
        piece,
        sourceDisplay.x,
        sourceDisplay.y,
        BOARD_CELL_SIZE,
        false,
      );
      preview.setAlpha(0.9);
      preview.setDepth(20);

      this.dragState = {
        pieceIndex,
        piece,
        source: sourceDisplay,
        preview,
        offsetX: pointer.x - sourceDisplay.x,
        offsetY: pointer.y - sourceDisplay.y,
        candidateRow: null,
        candidateCol: null,
        valid: false,
      };
    }

    private handlePointerMove(pointer: any) {
      if (!this.dragState) {
        return;
      }

      this.dragState.preview.x = pointer.x - this.dragState.offsetX;
      this.dragState.preview.y = pointer.y - this.dragState.offsetY;

      const candidateCol = Math.round(
        (this.dragState.preview.x - BOARD_ORIGIN.x) / BOARD_CELL_SIZE,
      );
      const candidateRow = Math.round(
        (this.dragState.preview.y - BOARD_ORIGIN.y) / BOARD_CELL_SIZE,
      );
      const valid = this.canPlacePiece(this.dragState.piece, candidateRow, candidateCol);

      this.dragState.candidateRow = candidateRow;
      this.dragState.candidateCol = candidateCol;
      this.dragState.valid = valid;

      this.drawGhost(candidateRow, candidateCol, this.dragState.piece, valid);
    }

    private handlePointerUp() {
      if (!this.dragState) {
        return;
      }

      const {
        candidateRow,
        candidateCol,
        valid,
        piece,
        pieceIndex,
        preview,
        source,
      } = this.dragState;

      if (
        valid &&
        candidateRow !== null &&
        candidateCol !== null &&
        this.canPlacePiece(piece, candidateRow, candidateCol)
      ) {
        this.placePiece(pieceIndex, piece, candidateRow, candidateCol);
      } else {
        source.setAlpha(1);
        this.statusMessage = 'Placement cancelled. Try another position.';
      }

      preview.destroy();
      this.dragState = null;
      this.clearGhost();
      this.emitSnapshot();
    }

    private clearGhost() {
      this.ghostGraphics.clear();
    }

    private drawGhost(
      row: number,
      col: number,
      piece: BlockJamQueuePiece,
      valid: boolean,
    ) {
      this.ghostGraphics.clear();

      if (!Number.isFinite(row) || !Number.isFinite(col)) {
        return;
      }

      this.ghostGraphics.fillStyle(valid ? 0x17c9b2 : 0xef4444, valid ? 0.18 : 0.12);
      this.ghostGraphics.lineStyle(2, valid ? 0x0f766e : 0x991b1b, 0.45);

      piece.cells.forEach((cell) => {
        const boardX = BOARD_ORIGIN.x + (col + cell.x) * BOARD_CELL_SIZE;
        const boardY = BOARD_ORIGIN.y + (row + cell.y) * BOARD_CELL_SIZE;

        this.ghostGraphics.fillRoundedRect(
          boardX + 4,
          boardY + 4,
          BOARD_CELL_SIZE - 8,
          BOARD_CELL_SIZE - 8,
          12,
        );
        this.ghostGraphics.strokeRoundedRect(
          boardX + 4,
          boardY + 4,
          BOARD_CELL_SIZE - 8,
          BOARD_CELL_SIZE - 8,
          12,
        );
      });
    }

    private canPlacePiece(piece: BlockJamQueuePiece, row: number, col: number) {
      return piece.cells.every((cell) => {
        const nextRow = row + cell.y;
        const nextCol = col + cell.x;

        return (
          nextRow >= 0 &&
          nextRow < BOARD_SIZE &&
          nextCol >= 0 &&
          nextCol < BOARD_SIZE &&
          this.board[nextRow][nextCol] === null
        );
      });
    }

    private placePiece(
      pieceIndex: number,
      piece: BlockJamQueuePiece,
      row: number,
      col: number,
    ) {
      piece.cells.forEach((cell) => {
        this.board[row + cell.y][col + cell.x] = piece.color;
      });

      this.moveCount += 1;
      this.score += piece.cells.length * 12;
      this.statusMessage = `Placed ${piece.name}.`;

      const clearedRows = this.getClearedRows();
      const clearedCols = this.getClearedCols();
      const clearedCount = clearedRows.length + clearedCols.length;
      this.lastClearCount = clearedCount;

      if (clearedCount > 0) {
        this.clearLines(clearedRows, clearedCols);
        this.combo += 1;
        this.linesCleared += clearedCount;

        const lineScore = clearedCount * 140;
        const multiBonus = clearedCount > 1 ? (clearedCount - 1) * 60 : 0;
        const comboBonus = this.combo * 35;
        this.score += lineScore + multiBonus + comboBonus;
        this.statusMessage = `Cleared ${clearedCount} line${clearedCount > 1 ? 's' : ''} with combo x${this.combo}.`;
      } else {
        this.combo = 0;
      }

      this.queue[pieceIndex] = createRandomQueuePiece();
      this.drawBoard();
      this.rebuildQueueDisplays();
      this.checkGameOver();
    }

    private getClearedRows() {
      const rows: number[] = [];

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        if (this.board[row].every(Boolean)) {
          rows.push(row);
        }
      }

      return rows;
    }

    private getClearedCols() {
      const cols: number[] = [];

      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const isFull = this.board.every((row) => row[col] !== null);

        if (isFull) {
          cols.push(col);
        }
      }

      return cols;
    }

    private clearLines(rows: number[], cols: number[]) {
      rows.forEach((row) => {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          this.board[row][col] = null;
        }
      });

      cols.forEach((col) => {
        for (let row = 0; row < BOARD_SIZE; row += 1) {
          this.board[row][col] = null;
        }
      });
    }

    private checkGameOver() {
      const hasMoves = this.queue.some((piece) => this.hasAvailablePlacement(piece));

      if (!hasMoves) {
        this.isGameOver = true;
        this.endedAt = Date.now();
        this.statusMessage = 'No valid placements left. Submit your score.';
      }
    }

    private hasAvailablePlacement(piece: BlockJamQueuePiece) {
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          if (this.canPlacePiece(piece, row, col)) {
            return true;
          }
        }
      }

      return false;
    }

    private emitSnapshot() {
      callbacks.onSnapshot({
        score: this.score,
        combo: this.combo,
        linesCleared: this.linesCleared,
        moveCount: this.moveCount,
        sessionDurationMs: getSessionDurationMs(this.startedAt, this.endedAt),
        queue: this.queue.map(toQueuePreview),
        isGameOver: this.isGameOver,
        lastClearCount: this.lastClearCount,
        statusMessage: this.statusMessage,
      });
    }
  })();
}
