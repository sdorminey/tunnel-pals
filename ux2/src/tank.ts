import GameGrid from "./game-grid";
import { CellType, TankAction, CellMoveType, GameInfo } from "./game-info";
import Sprites from "./sprites";
import { TankDirection } from "./messages";

export default class Tank {
  public x = 0;
  public y = 0;
  public hp = 0;
  public power = 0;
  public direction = TankDirection.Right;

  private readonly grid: GameGrid;

  constructor(grid: GameGrid) {
    this.grid = grid;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.grid.drawSprite(ctx, this.x, this.y, Tank.getSprite(this.direction), 3);
  }

  private static getSprite(direction: TankDirection): CellType[] {
    switch (direction) {
      case TankDirection.Left: return Sprites.tankLeft;
      case TankDirection.Right: return Sprites.tankRight;
      case TankDirection.Up: return Sprites.tankUp;
      case TankDirection.Down: return Sprites.tankDown;
      case TankDirection.UpLeft: return Sprites.tankUpLeft;
      case TankDirection.UpRight: return Sprites.tankUpRight;
      case TankDirection.DownLeft: return Sprites.tankDownLeft;
      case TankDirection.DownRight: return Sprites.tankDownRight;
    }
  }
}
