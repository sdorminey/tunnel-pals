import { CellType, GameInfo, CellMoveType } from './game-info';

const CELL_SIZE = 8;
export default class GameGrid {
  private readonly data: Array<CellType>;
  private readonly rows: number;
  private readonly cols: number;

  constructor(rows: number, cols: number, data: CellType[]) {
    this.rows = rows;
    this.cols = cols;
    this.data = data;
    //for (let k = 0; k < this.data.length; k++) {
    //  this.data[k] = Math.floor(Math.random() * 3) as CellType;
    //}
  }

  public set(other: GameGrid): void {
    for (let k = 0; k < other.data.length; k++) {
      this.data[k] = other.data[k];
    }
  }

  public coordsCellToPixel(pixelX: number, pixelY: number): [number, number] {
    return [pixelX * CELL_SIZE, pixelY * CELL_SIZE];
  }

  public coordsPixelToCell(cellX: number, cellY: number): [number, number] {
    return [Math.floor(cellX / CELL_SIZE), Math.floor(cellY / CELL_SIZE)];
  }

  public get maxX(): number {
    return this.cols * CELL_SIZE;
  }

  public get maxY(): number {
    return this.rows * CELL_SIZE;
  }

  public clearCell(x: number, y: number, w = 1, h = 1): void {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        this.data[row * this.rows + col] = CellType.Void;
      }
    }
  }

  public setCell(x: number, y: number, type: CellType): void {
    this.data[y * this.rows + x] = type;
  }

  public drawSprite(ctx: CanvasRenderingContext2D, x: number, y: number, sprite: CellType[], stride: number) {
    for (let row = 0; row < sprite.length / stride; row++) {
      for (let col = 0; col < stride; col++) {
        this.drawCell(ctx, col + x, row + y, sprite[row * stride + col]);
      }
    }
  }

  public setSprite(x: number, y: number, sprite: CellType[], stride: number) {
    for (let row = 0; row < sprite.length / stride; row++) {
      for (let col = 0; col < stride; col++) {
        this.data[(row + y) * this.rows + (col + x)] = sprite[row * stride + col];
      }
    }
  }

  public drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, type: CellType): void {
    if (type == CellType.Transparent) {
      return;
    }

    ctx.fillStyle = GameInfo.colorForCell(type);
    ctx.fillRect(CELL_SIZE * x, CELL_SIZE * y, CELL_SIZE, CELL_SIZE);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.drawSprite(ctx, 0, 0, this.data, this.cols);
  }

  public canMoveThroughBox(x: number, y: number, w = 1, h = 1): CellMoveType {
    let moveType = CellMoveType.None;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        moveType = Math.max(moveType, GameInfo.moveTypeForCell(this.data[row * this.rows + col]));
      }
    }

    return moveType;
  }
}
