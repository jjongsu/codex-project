import type * as PhaserModuleType from 'phaser';

import {
  BOARD_CELL_SIZE,
  BOARD_ORIGIN,
  BOARD_SIZE,
  QUEUE_LAYOUT,
  SCENE_SIZE,
  createInitialQueue,
  createQueuePieceFromShapeId,
  createRandomQueuePiece,
  hexToNumber,
  toQueuePreview,
} from '@/features/games/block-jam-blitz/config';
import type {
  BlockJamAutomationScenario,
  BlockJamAutomationState,
  BlockJamQueuePiece,
  BlockJamSceneController,
  BlockJamSelectionState,
  BlockJamSnapshot,
} from '@/features/games/block-jam-blitz/types';

type PhaserModule = typeof PhaserModuleType;

interface BlockJamSceneCallbacks {
  onSnapshot: (snapshot: BlockJamSnapshot) => void;
}

interface BlockJamSceneOptions {
  automationEnabled?: boolean;
  automationScenario?: BlockJamAutomationScenario;
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

const AUTOMATION_QUEUE_SEQUENCE = [
  'square-2',
  'bar-3-h',
  'dot',
  'bar-3-v',
  'l-3',
  'bar-4-h',
  't-4',
  'square-2',
] as const;

function createBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
}

function setBoardCells(
  board: BoardState,
  cells: Array<{ row: number; col: number; color: string }>,
) {
  cells.forEach(({ row, col, color }) => {
    board[row][col] = color;
  });
}

function createMidgameBoard(): BoardState {
  const board = createBoard();

  setBoardCells(board, [
    { row: 0, col: 0, color: '#17c9b2' },
    { row: 0, col: 1, color: '#17c9b2' },
    { row: 0, col: 2, color: '#17c9b2' },
    { row: 0, col: 3, color: '#17c9b2' },
    { row: 0, col: 4, color: '#17c9b2' },
    { row: 3, col: 2, color: '#0ea5e9' },
    { row: 3, col: 3, color: '#facc15' },
    { row: 4, col: 2, color: '#0ea5e9' },
    { row: 5, col: 5, color: '#f43f5e' },
  ]);

  return board;
}

function createGameOverBoard(): BoardState {
  const board = createBoard();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if ((row + col) % 2 === 0) {
        board[row][col] = '#ff9b54';
      }
    }
  }

  return board;
}

function isTextInputFocused() {
  if (typeof document === 'undefined') {
    return false;
  }

  const activeElement = document.activeElement;

  return (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement ||
    activeElement instanceof HTMLSelectElement
  );
}

export function createBlockJamBlitzScene(
  Phaser: PhaserModule,
  callbacks: BlockJamSceneCallbacks,
  options: BlockJamSceneOptions = {},
): PhaserModuleType.Scene & BlockJamSceneController {
  return new (class BlockJamBlitzScene
    extends Phaser.Scene
    implements BlockJamSceneController
  {
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

    private statusMessage = 'Drag one of the three blocks onto the board.';

    private queue: BlockJamQueuePiece[] = [];

    private dragState: DragState | null = null;

    private selectedPieceIndex = 0;

    private cursorRow = 0;

    private cursorCol = 0;

    private sessionDurationMs = 0;

    private lastClockSampleAt = 0;

    private automationEnabled = options.automationEnabled ?? false;

    private automationScenario = options.automationScenario ?? 'default';

    private automationSequenceIndex = 0;

    private lastDragFeedbackKey = '';

    constructor() {
      super('block-jam-blitz');
    }

    create() {
      this.drawBackdrop();
      this.boardGraphics = this.add.graphics();
      this.boardGraphics.setDepth(1);
      this.ghostGraphics = this.add.graphics();
      this.ghostGraphics.setDepth(2);
      this.lastClockSampleAt = Date.now();
      this.buildQueueArea();
      this.registerInput();
      this.registerKeyboardControls();
      this.loadScenario(
        this.automationEnabled ? this.automationScenario : 'default',
      );
    }

    getSnapshot() {
      this.syncClockWithRealtime();

      return {
        score: this.score,
        combo: this.combo,
        linesCleared: this.linesCleared,
        moveCount: this.moveCount,
        sessionDurationMs: this.sessionDurationMs,
        queue: this.queue.map(toQueuePreview),
        isGameOver: this.isGameOver,
        lastClearCount: this.lastClearCount,
        statusMessage: this.statusMessage,
        selection: this.getSelectionState(),
      };
    }

    private getSelectionState(): BlockJamSelectionState | null {
      if (this.isGameOver) {
        return null;
      }

      if (this.dragState) {
        return {
          pieceIndex: this.dragState.pieceIndex,
          pieceName: this.dragState.piece.name,
          row: this.dragState.candidateRow ?? this.cursorRow,
          col: this.dragState.candidateCol ?? this.cursorCol,
          valid: this.dragState.valid,
          inputMode: 'drag',
        };
      }

      const selectedPiece = this.queue[this.selectedPieceIndex];

      if (!selectedPiece) {
        return null;
      }

      return {
        pieceIndex: this.selectedPieceIndex,
        pieceName: selectedPiece.name,
        row: this.cursorRow,
        col: this.cursorCol,
        valid: this.canPlacePiece(selectedPiece, this.cursorRow, this.cursorCol),
        inputMode: 'cursor',
      };
    }

    getAutomationState(): BlockJamAutomationState {
      const selectedPiece = this.queue[this.selectedPieceIndex];
      const cursorValid = selectedPiece
        ? this.canPlacePiece(selectedPiece, this.cursorRow, this.cursorCol)
        : false;

      return {
        schemaVersion: 1,
        game: 'block-jam-blitz',
        scenario: this.automationScenario,
        mode: this.isGameOver ? 'game-over' : 'running',
        coordinateSystem: {
          origin: 'top-left',
          rowAxis: 'down',
          colAxis: 'right',
          boardSize: BOARD_SIZE,
          cellUnit: 'board-cell',
        },
        score: this.score,
        combo: this.combo,
        linesCleared: this.linesCleared,
        moveCount: this.moveCount,
        sessionDurationMs: this.sessionDurationMs,
        statusMessage: this.statusMessage,
        board: this.board.map((row) =>
          row.map((cell) => (cell ? 'X' : '.')).join(''),
        ),
        queue: this.queue.map((piece, index) => ({
          index,
          token: piece.token,
          id: piece.id,
          name: piece.name,
          color: piece.color,
          width: piece.width,
          height: piece.height,
          cells: piece.cells.map((cell) => ({ ...cell })),
        })),
        availablePlacements: this.queue.map((piece, pieceIndex) => ({
          pieceIndex,
          count: this.countAvailablePlacements(piece),
        })),
        cursor: selectedPiece
          ? {
              row: this.cursorRow,
              col: this.cursorCol,
              pieceIndex: this.selectedPieceIndex,
              pieceName: selectedPiece.name,
              valid: cursorValid,
            }
          : null,
        drag: this.dragState
          ? {
              pieceIndex: this.dragState.pieceIndex,
              pieceName: this.dragState.piece.name,
              row: this.dragState.candidateRow,
              col: this.dragState.candidateCol,
              valid: this.dragState.valid,
            }
          : null,
        isGameOver: this.isGameOver,
      };
    }

    advanceTime(ms: number) {
      this.syncClockWithRealtime();

      if (!this.isGameOver) {
        this.sessionDurationMs += Math.max(0, Math.trunc(ms));
      }

      this.lastClockSampleAt = Date.now();
      this.emitSnapshot();
    }

    private syncClockWithRealtime() {
      if (this.isGameOver) {
        return;
      }

      const now = Date.now();
      this.sessionDurationMs += Math.max(0, now - this.lastClockSampleAt);
      this.lastClockSampleAt = now;
    }

    private loadScenario(scenario: BlockJamAutomationScenario) {
      this.board = createBoard();
      this.queue = [];
      this.score = 0;
      this.combo = 0;
      this.linesCleared = 0;
      this.moveCount = 0;
      this.lastClearCount = 0;
      this.isGameOver = false;
      this.dragState = null;
      this.selectedPieceIndex = 0;
      this.cursorRow = 0;
      this.cursorCol = 0;
      this.sessionDurationMs = 0;
      this.lastClockSampleAt = Date.now();
      this.automationSequenceIndex = 0;
      this.automationScenario = scenario;
      this.lastDragFeedbackKey = '';

      if (scenario === 'midgame') {
        this.board = createMidgameBoard();
        this.queue = [
          createQueuePieceFromShapeId('bar-3-h'),
          createQueuePieceFromShapeId('square-2'),
          createQueuePieceFromShapeId('dot'),
        ];
        this.score = 264;
        this.combo = 1;
        this.linesCleared = 1;
        this.moveCount = 4;
        this.sessionDurationMs = 18000;
        this.cursorRow = 0;
        this.cursorCol = 5;
        this.statusMessage = 'Automation scenario ready. Press Enter to clear row 0.';
      } else if (scenario === 'game-over') {
        this.board = createGameOverBoard();
        this.queue = [
          createQueuePieceFromShapeId('square-2'),
          createQueuePieceFromShapeId('bar-3-h'),
          createQueuePieceFromShapeId('bar-3-v'),
        ];
        this.score = 612;
        this.combo = 0;
        this.linesCleared = 4;
        this.moveCount = 9;
        this.sessionDurationMs = 46000;
        this.isGameOver = true;
        this.statusMessage = 'No valid placements left. Submit your score.';
      } else if (scenario === 'start') {
        this.queue = [
          createQueuePieceFromShapeId('square-2'),
          createQueuePieceFromShapeId('bar-3-h'),
          createQueuePieceFromShapeId('dot'),
        ];
        this.statusMessage = 'Automation start scenario ready.';
      } else {
        this.queue = this.automationEnabled
          ? [
              createQueuePieceFromShapeId('square-2'),
              createQueuePieceFromShapeId('bar-3-h'),
              createQueuePieceFromShapeId('dot'),
            ]
          : createInitialQueue();
        this.statusMessage = 'Drag one of the three blocks onto the board.';
      }

      this.drawBoard();
      this.redrawQueueSlotBackgrounds();
      this.rebuildQueueDisplays();
      this.updateKeyboardGhost();
      this.emitSnapshot();
    }

    private getNextQueuePiece() {
      if (!this.automationEnabled) {
        return createRandomQueuePiece();
      }

      const shapeId =
        AUTOMATION_QUEUE_SEQUENCE[
          this.automationSequenceIndex % AUTOMATION_QUEUE_SEQUENCE.length
        ];
      this.automationSequenceIndex += 1;

      return createQueuePieceFromShapeId(shapeId);
    }

    private drawBackdrop() {
      const backdrop = this.add.graphics();
      backdrop.setDepth(-20);
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

      this.boardGraphics.fillStyle(0xe7d8bd, 1);
      this.boardGraphics.fillRoundedRect(
        BOARD_ORIGIN.x - 12,
        BOARD_ORIGIN.y - 12,
        BOARD_SIZE * BOARD_CELL_SIZE + 24,
        BOARD_SIZE * BOARD_CELL_SIZE + 24,
        28,
      );
      this.boardGraphics.lineStyle(3, 0xc4b18e, 0.95);
      this.boardGraphics.strokeRoundedRect(
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
            cellColor ? hexToNumber(cellColor) : 0xf9efd9,
            cellColor ? 0.95 : 1,
          );
          this.boardGraphics.fillRoundedRect(
            x + 2,
            y + 2,
            BOARD_CELL_SIZE - 4,
            BOARD_CELL_SIZE - 4,
            12,
          );
          this.boardGraphics.lineStyle(
            cellColor ? 2 : 2,
            cellColor ? 0xfffcf7 : 0xcdb892,
            1,
          );
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
        graphics.setDepth(4);
        this.queueSlotBackgrounds.push(graphics);
      }

      const queueLabel = this.add.text(36, QUEUE_LAYOUT.y - 28, 'Queue', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '14px',
        color: '#5d5242',
        fontStyle: '700',
      });
      queueLabel.setDepth(5);
      this.redrawQueueSlotBackgrounds();
    }

    private redrawQueueSlotBackgrounds() {
      this.queueSlotBackgrounds.forEach((graphics, index) => {
        const x = QUEUE_LAYOUT.x + index * (QUEUE_LAYOUT.slotWidth + QUEUE_LAYOUT.gap);
        const y = QUEUE_LAYOUT.y;
        const isSelected = index === this.selectedPieceIndex && !this.isGameOver;

        graphics.clear();
        graphics.fillStyle(isSelected ? 0xe9fffb : 0xfff8ea, 1);
        graphics.fillRoundedRect(x, y, QUEUE_LAYOUT.slotWidth, QUEUE_LAYOUT.slotHeight, 24);
        graphics.lineStyle(
          isSelected ? 3 : 1,
          isSelected ? 0x17c9b2 : 0xe9dcc4,
          1,
        );
        graphics.strokeRoundedRect(x, y, QUEUE_LAYOUT.slotWidth, QUEUE_LAYOUT.slotHeight, 24);
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
      container.setDepth(interactive ? 6 : 3);

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

    private registerKeyboardControls() {
      const keyboard = this.input.keyboard;

      if (!keyboard) {
        return;
      }

      keyboard.on('keydown-LEFT', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.moveCursor(0, -1);
      });
      keyboard.on('keydown-RIGHT', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.moveCursor(0, 1);
      });
      keyboard.on('keydown-UP', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.moveCursor(-1, 0);
      });
      keyboard.on('keydown-DOWN', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.moveCursor(1, 0);
      });
      keyboard.on('keydown-A', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.stepSelectedPiece(-1);
      });
      keyboard.on('keydown-B', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.stepSelectedPiece(1);
      });
      keyboard.on('keydown-ENTER', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.placeSelectedPieceAtCursor();
      });
      keyboard.on('keydown-SPACE', () => {
        if (this.shouldIgnoreKeyboardInput()) {
          return;
        }

        this.placeSelectedPieceAtCursor();
      });
    }

    private shouldIgnoreKeyboardInput() {
      return this.dragState !== null || this.isGameOver || isTextInputFocused();
    }

    private moveCursor(rowDelta: number, colDelta: number) {
      this.cursorRow = Phaser.Math.Clamp(this.cursorRow + rowDelta, 0, BOARD_SIZE - 1);
      this.cursorCol = Phaser.Math.Clamp(this.cursorCol + colDelta, 0, BOARD_SIZE - 1);
      this.statusMessage = `Cursor at row ${this.cursorRow + 1}, col ${this.cursorCol + 1}.`;
      this.redrawQueueSlotBackgrounds();
      this.updateKeyboardGhost();
      this.emitSnapshot();
    }

    private stepSelectedPiece(direction: number) {
      if (this.queue.length === 0) {
        return;
      }

      this.selectedPieceIndex =
        (this.selectedPieceIndex + direction + this.queue.length) % this.queue.length;
      this.statusMessage = `Selected ${this.queue[this.selectedPieceIndex].name}.`;
      this.redrawQueueSlotBackgrounds();
      this.updateKeyboardGhost();
      this.emitSnapshot();
    }

    private placeSelectedPieceAtCursor() {
      const piece = this.queue[this.selectedPieceIndex];

      if (!piece) {
        return;
      }

      if (!this.canPlacePiece(piece, this.cursorRow, this.cursorCol)) {
        this.statusMessage = 'Selected piece does not fit at the cursor.';
        this.updateKeyboardGhost();
        this.emitSnapshot();
        return;
      }

      this.placePiece(
        this.selectedPieceIndex,
        piece,
        this.cursorRow,
        this.cursorCol,
      );
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

      this.syncClockWithRealtime();
      this.selectedPieceIndex = pieceIndex;
      sourceDisplay.setAlpha(0.35);
      this.redrawQueueSlotBackgrounds();

      const isTouch =
        pointer?.event?.pointerType === 'touch' || Boolean(pointer?.wasTouch);
      const verticalAssist = isTouch ? BOARD_CELL_SIZE * 1.2 : 0;

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
        offsetY: pointer.y - sourceDisplay.y + verticalAssist,
        candidateRow: null,
        candidateCol: null,
        valid: false,
      };
      this.lastDragFeedbackKey = '';
      this.statusMessage = `Dragging ${piece.name}. Release on a highlighted slot.`;

      this.emitSnapshot();
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

      const feedbackKey = `${candidateRow}:${candidateCol}:${valid}`;

      if (feedbackKey !== this.lastDragFeedbackKey) {
        if (!Number.isFinite(candidateRow) || !Number.isFinite(candidateCol)) {
          this.statusMessage = `Dragging ${this.dragState.piece.name}. Move onto the board to preview placement.`;
        } else if (valid) {
          this.statusMessage = `Release to place ${this.dragState.piece.name} at row ${candidateRow + 1}, col ${candidateCol + 1}.`;
        } else {
          this.statusMessage = `${this.dragState.piece.name} does not fit at row ${candidateRow + 1}, col ${candidateCol + 1}.`;
        }

        this.lastDragFeedbackKey = feedbackKey;
        this.emitSnapshot();
      }
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
        this.statusMessage = `${piece.name} could not be placed there. Try another gap.`;
      }

      preview.destroy();
      this.dragState = null;
      this.lastDragFeedbackKey = '';
      this.redrawQueueSlotBackgrounds();
      this.updateKeyboardGhost();
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

      const maxX = Math.max(...piece.cells.map((cell) => cell.x));
      const maxY = Math.max(...piece.cells.map((cell) => cell.y));
      const outlineX = BOARD_ORIGIN.x + col * BOARD_CELL_SIZE + 2;
      const outlineY = BOARD_ORIGIN.y + row * BOARD_CELL_SIZE + 2;
      const outlineWidth = (maxX + 1) * BOARD_CELL_SIZE - 4;
      const outlineHeight = (maxY + 1) * BOARD_CELL_SIZE - 4;

      this.ghostGraphics.lineStyle(3, valid ? 0x14b8a6 : 0xdc2626, 0.9);
      this.ghostGraphics.strokeRoundedRect(
        outlineX,
        outlineY,
        outlineWidth,
        outlineHeight,
        16,
      );
    }

    private updateKeyboardGhost() {
      if (this.dragState || this.isGameOver) {
        this.clearGhost();
        return;
      }

      const piece = this.queue[this.selectedPieceIndex];

      if (!piece) {
        this.clearGhost();
        return;
      }

      const valid = this.canPlacePiece(piece, this.cursorRow, this.cursorCol);
      this.drawGhost(this.cursorRow, this.cursorCol, piece, valid);
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

    private countAvailablePlacements(piece: BlockJamQueuePiece) {
      let count = 0;

      for (let row = 0; row < BOARD_SIZE; row += 1) {
        for (let col = 0; col < BOARD_SIZE; col += 1) {
          if (this.canPlacePiece(piece, row, col)) {
            count += 1;
          }
        }
      }

      return count;
    }

    private placePiece(
      pieceIndex: number,
      piece: BlockJamQueuePiece,
      row: number,
      col: number,
    ) {
      this.syncClockWithRealtime();

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

      this.queue[pieceIndex] = this.getNextQueuePiece();
      this.selectedPieceIndex = pieceIndex;
      this.cursorRow = row;
      this.cursorCol = col;
      this.drawBoard();
      this.rebuildQueueDisplays();
      this.checkGameOver();
      this.redrawQueueSlotBackgrounds();
      this.updateKeyboardGhost();
      this.emitSnapshot();
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
        this.syncClockWithRealtime();
        this.isGameOver = true;
        this.statusMessage = 'No valid placements left. Submit your score.';
      }
    }

    private hasAvailablePlacement(piece: BlockJamQueuePiece) {
      return this.countAvailablePlacements(piece) > 0;
    }

    private emitSnapshot() {
      callbacks.onSnapshot(this.getSnapshot());
    }
  })();
}
