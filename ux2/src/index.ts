import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import { BaseMessage, MessageType, GridDataMessage, TankMoveMessage, TankInputMessage, GridUpdatesMessage } from './messages';
import Tank from './tank';

class Game {
  private readonly canvas: HTMLCanvasElement;
  private grid: GameGrid;
  private tank: Tank;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly controller: InputController;
  private readonly ws: WebSocket;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.controller = new InputController();
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
    //this.tank.render(this.ctx);
  }

  public updateLoop(): void {
    this.render();
  }

  private handleInput(event: KeyboardEvent): void {
    this.controller.receiveInput(event);
    const direction = this.controller.getTankDirection();
    this.ws.send(JSON.stringify(<TankInputMessage>{
      direction: direction,
      type: MessageType.TankInput
    }));

    const shooting = this.controller.isShooting();
    if (shooting) {
      this.ws.send(JSON.stringify(<BaseMessage>{
        type: MessageType.TankShoot
      }));
    }
  }

  private start(): void {
    window.addEventListener("keydown", (event) => this.handleInput(event), true);
    window.addEventListener("keyup", (event) => this.handleInput(event), true);
    game.render();
    window.setInterval(() => game.updateLoop(), 25);
  }

  private onMessage(event: MessageEvent): void {
    const untyped = <BaseMessage>(JSON.parse(event.data));
    switch (untyped.type) {
      case MessageType.GridData:
        {
          const message = <GridDataMessage>(untyped);
          this.grid = new GameGrid(message.rows, message.cols, message.grid);
          this.tank = new Tank(this.grid);
          this.tank.x = message.tankX;
          this.tank.y = message.tankY;
          this.tank.direction = message.tankDirection;
          this.start();
          break;
        }
      case MessageType.TankMove:
        {
          const message = <TankMoveMessage>(untyped);
          this.tank.direction = message.direction;
          this.tank.x = message.x;
          this.tank.y = message.y;
          break;
        }
      case MessageType.GridUpdates:
        {
          const message = <GridUpdatesMessage>(untyped);
          for (let update of message.updates) {
            this.grid.setCell(update.x, update.y, update.type);
          }
          break;
        }
      default:
        console.log("No idea what this message was!");
        break;
    }
    //this.render()
  }
}

const c = document.getElementById('canvas') as HTMLCanvasElement;
const game = new Game(c);