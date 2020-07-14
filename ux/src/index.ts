import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import Tank from './tank';
import Shots from './shots';
import { GameInfo } from './game-info';
import Sprites from './sprites';
import { BaseMessage, MessageType, GridDataMessage } from './messages';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());


class Game {
  private readonly canvas: HTMLCanvasElement;
  private grid: GameGrid;
  private readonly ctx: CanvasRenderingContext2D;
  private tank: Tank;
  private readonly shots: Shots;
  private readonly controller: InputController;
  private readonly ws: WebSocket;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.controller = new InputController();
    this.shots = new Shots();
    this.ws = new WebSocket("ws://127.0.0.1:8080/back");
    this.ws.onmessage = (event) => this.onMessage(event);
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

  private start(): void {
    this.canvas.addEventListener("keydown", (event) => this.handleInput(event), true);
    this.canvas.addEventListener("keyup", (event) => this.handleInput(event), true);
    game.render();
    window.setInterval(() => game.updateLoop(), 25);
  }

  private onMessage(event: MessageEvent): void {
    const untyped = <BaseMessage>(JSON.parse(event.data));
    switch (untyped.type) {
      case MessageType.GridData:
        const message = <GridDataMessage>(untyped);
        this.grid = new GameGrid(message.rows, message.cols, message.grid);
        this.tank = new Tank(this.grid);
        this.start();
        break;
      default:
        console.log("No idea what this message was!");
        break;
    }
  }
}

const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);