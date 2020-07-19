import GameGrid from "./game-grid";

const NO_STATIC_ABOVE = 50;
const CELL_SIZE = 8;
export default class Effects {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public shouldStatic(power: number): boolean {
    return Math.random() >= Math.log2(power)/Math.log2(100);
  }

  public drawStatic(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.resetTransform();
    for (let x = 0; x < this.width / CELL_SIZE; x++) {
      for (let y = 0; y < this.height / CELL_SIZE; y++) {
        this.ctx.fillStyle = "#" + Math.floor(Math.random()*16777215).toString(16);
        this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}