import * as _ from 'lodash';
import { InputController } from './input';
import GameGrid from './game-grid';
import { BaseMessage, MessageType, GridDataMessage, TankMoveMessage, TankInputMessage, GridUpdatesMessage, LoginMessage } from './messages';
import Tank from './tank';
import { Prediction } from './prediction';
import Effects from './effects';

class Game {
  private readonly canvas: HTMLCanvasElement;
  private grid: GameGrid;
  private predictiveGrid: GameGrid;
  private prediction: Prediction;
  private tank: Tank;
  private receivedRealFrame = false;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly controller: InputController;
  private readonly ws: WebSocket;
  private readonly tankName: string;
  private readonly effects: Effects;

  constructor(canvas: HTMLCanvasElement, tankName: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.effects = new Effects(this.ctx, this.canvas.width, this.canvas.height);
    this.controller = new InputController();
    this.tankName = tankName;
    this.ws = new WebSocket(`ws://${window.location.hostname}:8765/back`);
    this.ws.onmessage = (event) => this.onMessage(event);
  }

  public render(): void {
    if (this.effects.shouldStatic(this.tank.power)) {
      this.effects.drawStatic();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.resetTransform();
    var [spriteX, spriteY] = this.predictiveGrid.coordsCellToPixel(this.tank.x, this.tank.y);
    let cameraX = Math.min(Math.max(0, spriteX - this.canvas.width / 2), this.predictiveGrid.maxX - this.canvas.width);
    let cameraY = Math.min(Math.max(0, spriteY - this.canvas.height / 2), this.predictiveGrid.maxY - this.canvas.height);
    this.ctx.translate(-cameraX, -cameraY);
    this.predictiveGrid.render(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);
    document.getElementById("#hp").innerText = this.tank.hp.toString();
    document.getElementById("#power").innerText = this.tank.power.toString();
    //this.tank.render(this.ctx);
  }

  public updateLoop(): void {
    if (!this.receivedRealFrame) {
      const predictionElement = <HTMLInputElement>(document.getElementById("prediction"));
      if (predictionElement.checked) {
        this.prediction.moveTank(this.tank, this.controller.getTankDirection());
      }
    }

    this.render();
    this.receivedRealFrame = false;
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
    this.render();
    window.setInterval(() => this.updateLoop(), 25);
  }

  private onMessage(event: MessageEvent): void {
    const untyped = <BaseMessage>(JSON.parse(event.data));
    switch (untyped.type) {
      case MessageType.Hi:
        {
          this.ws.send(JSON.stringify(<LoginMessage>{
            type: MessageType.Login,
            tankName: this.tankName
          }));
          break;
        }
      case MessageType.GridData:
        {
          const message = <GridDataMessage>(untyped);
          this.grid = new GameGrid(message.rows, message.cols, message.grid);
          this.predictiveGrid = new GameGrid(message.rows, message.cols, [...message.grid]);
          this.prediction = new Prediction(this.predictiveGrid);
          this.tank = new Tank();
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
          this.tank.hp = message.hp;
          this.tank.power = message.power;
          break;
        }
      case MessageType.GridUpdates:
        {
          const message = <GridUpdatesMessage>(untyped);
          for (let update of message.updates) {
            this.grid.setCell(update.x, update.y, update.type);
          }
          this.predictiveGrid.set(this.grid);
          this.receivedRealFrame = true;
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
const game = new Game(c, window.location.hash);