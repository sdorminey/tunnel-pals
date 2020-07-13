import * as _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());


class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly background: GameGrid;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tank: Tank;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.background = new GameGrid(128, 128);
    this.tank = new Tank(this.background);

    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.resetTransform();
    var [spriteX, spriteY] = this.background.coordsCellToPixel(this.tank.x, this.tank.y);
    let cameraX = Math.min(Math.max(0, spriteX - this.canvas.width / 2), this.background.maxX - this.canvas.width);
    let cameraY = Math.min(Math.max(0, spriteY - this.canvas.height / 2), this.background.maxY - this.canvas.height);
    this.ctx.translate(-cameraX, -cameraY);
    this.background.render(this.ctx);
    this.tank.render(this.ctx);
  }

  private handleInput(event: KeyboardEvent): void {
    if (event.keyCode == 188) {
      this.tank.takeAction(TankAction.MoveUp);
    }

    if (event.keyCode == 65) {
      this.tank.takeAction(TankAction.MoveLeft);
    }

    if (event.keyCode == 69) {
      this.tank.takeAction(TankAction.MoveRight);
    }

    if (event.keyCode == 79) {
      this.tank.takeAction(TankAction.MoveDown);
    }

    this.render();
  }
}

enum CellType {
  Transparent = -1,
  Void = 0,
  LightSand = 1,
  DarkSand = 2,
  GreenTankBody = 3
}

enum TankAction {
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown
}

const CELL_SIZE = 8;

class Tank {
  public x = 0;
  public y = 0;

  private readonly grid: GameGrid;
  private sprite: CellType[];

  private readonly tankRight: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent
  ];

  private readonly tankUp: CellType[] = [
    CellType.Transparent, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
  ]

  private readonly tankLeft: CellType[] = [
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
  ]

  private readonly tankDown: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.Transparent,
  ]

  constructor(grid: GameGrid) {
    this.grid = grid;
    this.sprite = this.tankRight;
  }

  public takeAction(action: TankAction): void {
    switch (action) {
      case TankAction.MoveLeft:
        this.sprite = this.tankLeft;
        this.x--;
        break;
      case TankAction.MoveRight:
        this.sprite = this.tankRight;
        this.x++;
        break;
      case TankAction.MoveUp:
        this.sprite = this.tankUp;
        this.y--;
        break;
      case TankAction.MoveDown:
        this.sprite = this.tankDown;
        this.y++;
        break;
    }

    // Clear under the tank.
    this.grid.clearCell(this.x, this.y, 3, 3);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.grid.drawSprite(ctx, this.x, this.y, this.sprite, 3);
  }

}

class GameGrid {
  private readonly data: Array<CellType>;
  private readonly rows: number;
  private readonly cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.data = Array<CellType>(rows * cols);
    for (let k = 0; k < this.data.length; k++) {
      this.data[k] = Math.floor(Math.random() * 3) as CellType;
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

  public drawSprite(ctx: CanvasRenderingContext2D, x: number, y: number, sprite: CellType[], stride: number) {
    for (let row = 0; row < sprite.length / stride; row++) {
      for (let col = 0; col < stride; col++) {
        this.drawCell(ctx, col + x, row + y, sprite[row * stride + col]);
      }
    }
  }

  public drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, type: CellType): void {
    if (type == CellType.Transparent) {
      return;
    }

    ctx.fillStyle = GameGrid.colorForCell(type);
    ctx.fillRect(CELL_SIZE * x, CELL_SIZE * y, CELL_SIZE, CELL_SIZE);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.drawSprite(ctx, 0, 0, this.data, this.cols);
  }

  private static colorForCell(type: CellType): string {
    switch (type) {
      case CellType.Void:
        return "#000000";
      case CellType.LightSand:
        return "#fc9003";
      case CellType.DarkSand:
        return "#7d4700";
      case CellType.GreenTankBody:
        return "#00ff00";
    }
  }
}


const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
game.render();
//window.setInterval(() => game.render(), 50);