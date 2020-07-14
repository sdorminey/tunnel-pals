import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import Tank from './tank';
import Shots from './shots';
import { GameInfo } from './game-info';
import Sprites from './sprites';

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

  public updateLoop(): void {
    const nextAction = this.controller.getTankAction();
    if (nextAction) {
      this.tank.takeAction(nextAction);
    }

    if (this.controller.isShooting()) {
      const [gunX, gunY] = Sprites.getGunOffset(this.tank.direction);
      this.shots.add(this.tank.x + gunX, this.tank.y + gunY, this.tank.direction);
    }

    this.shots.tick(this.grid);
    this.render();
  }

  private handleInput(event: KeyboardEvent): void {
    this.controller.receiveInput(event);
  }
}

const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);
game.render();
window.setInterval(() => game.updateLoop(), 25);