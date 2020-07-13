import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import Tank from './tank';

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
  private readonly controller: InputController;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.background = new GameGrid(128, 128);
    this.tank = new Tank(this.background);
    this.controller = new InputController();

    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
    this.canvas.addEventListener("keyup", (event) => this.handleInput(event), true);
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
    this.controller.receiveInput(event);
    const nextAction = this.controller.getInputAction();
    if (nextAction) {
      this.tank.takeAction(nextAction);
    }

    this.render();
  }
}

const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
game.render();