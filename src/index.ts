import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import Tank from './tank';
import Shots from './shots';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());


class Game {
  private readonly canvas: HTMLCanvasElement;
  private readonly grid: GameGrid;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly tank: Tank;
  private readonly shots: Shots;
  private readonly controller: InputController;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.grid = new GameGrid(128, 128);
    this.tank = new Tank(this.grid);
    this.controller = new InputController();
    this.shots = new Shots();

    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
    this.canvas.addEventListener("keyup", (event) => this.handleInput(event), true);
  }

  public render(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.resetTransform();
    var [spriteX, spriteY] = this.grid.coordsCellToPixel(this.tank.x, this.tank.y);
    let cameraX = Math.min(Math.max(0, spriteX - this.canvas.width / 2), this.grid.maxX - this.canvas.width);
    let cameraY = Math.min(Math.max(0, spriteY - this.canvas.height / 2), this.grid.maxY - this.canvas.height);
    this.ctx.translate(-cameraX, -cameraY);
    this.grid.render(this.ctx);
    this.tank.render(this.ctx);
  }

  private handleInput(event: KeyboardEvent): void {
    this.controller.receiveInput(event);
    const nextAction = this.controller.getTankAction();
    if (nextAction) {
      this.tank.takeAction(nextAction);
    }

    if (this.controller.isShooting()) {
      this.shots.add(this.tank.x, this.tank.y, this.tank.direction);
    }

    this.shots.tick(this.grid);
    this.render();
  }
}

const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
game.render();