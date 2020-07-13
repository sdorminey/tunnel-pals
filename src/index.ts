import * as _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());


class State {
  public x = 0;
  public y = 0;
  public speed = 5;
}

class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly background: Background;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly state: State;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = new State();
    this.background = new Background(128, 128);

    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.resetTransform();
    let cameraX = Math.min(Math.max(0, this.state.x - this.canvas.width / 2), this.background.maxX - this.canvas.width);
    let cameraY = Math.min(Math.max(0, this.state.y - this.canvas.height / 2), this.background.maxY - this.canvas.height);
    this.ctx.translate(-cameraX, -cameraY);
    this.background.render(this.ctx);
    this.ctx.beginPath();
    this.ctx.strokeStyle = "#ff0000";
    this.ctx.arc(this.state.x, this.state.y, 16, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  private handleInput(event: KeyboardEvent): void {
    if (event.keyCode == 188) {
      this.state.y -= this.state.speed;
    }

    if (event.keyCode == 65) {
      this.state.x -= this.state.speed;
    }

    if (event.keyCode == 69) {
      this.state.x += this.state.speed;
    }

    if (event.keyCode == 79) {
      this.state.y += this.state.speed;
    }

    this.render();
  }
}

enum CellType {
  Void = 0,
  LightSand = 1,
  DarkSand = 2
}

const CELL_SIZE = 8;
class Background {
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

  public get maxX(): number {
    return this.rows * CELL_SIZE;
  }

  public get maxY(): number {
    return this.cols * CELL_SIZE;
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        ctx.fillStyle = Background.colorForCell(this.data[row * this.rows + col]);
        ctx.fillRect(CELL_SIZE * row, CELL_SIZE * col, CELL_SIZE, CELL_SIZE);
      }
    }
  }

  private static colorForCell(type: CellType): string {
    switch (type) {
      case CellType.Void:
        return "#000000";
      case CellType.LightSand:
        return "#fc9003";
      case CellType.DarkSand:
        return "#7d4700";
    }
  }
}


const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
game.render();
//window.setInterval(() => game.render(), 50);