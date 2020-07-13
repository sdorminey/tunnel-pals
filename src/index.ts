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
  private readonly ctx: CanvasRenderingContext2D;
  private readonly state: State;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.state = new State();

    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fillRect(this.state.x, this.state.y, 320, 240);
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


const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
window.setInterval(() => game.render(), 50);