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
    this.ctx.translate(this.state.x, this.state.y);
    this.background.render(this.ctx);
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

const CELL_SIZE = 16;
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