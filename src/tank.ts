import GameGrid from "./game-grid";
import { CellType, TankAction, CellMoveType } from "./game-info";
import Sprites from "./sprites";

export default class Tank {
  public x = 0;
  public y = 0;

  private readonly grid: GameGrid;
  private sprite: CellType[];
  private delay = 0;

  constructor(grid: GameGrid) {
    this.grid = grid;
    this.sprite = Sprites.tankRight;
  }

  public takeAction(action: TankAction): void {
    let newX = this.x, newY = this.y;
    switch (action) {
      case TankAction.MoveLeft:
        this.sprite = Sprites.tankLeft;
        newX--;
        break;
      case TankAction.MoveRight:
        this.sprite = Sprites.tankRight;
        newX++;
        break;
      case TankAction.MoveUp:
        this.sprite = Sprites.tankUp;
        newY--;
        break;
      case TankAction.MoveDown:
        this.sprite = Sprites.tankDown;
        newY++;
        break;
    }

    switch (this.grid.canMoveThroughBox(newX, newY, 3, 3)) {
      case CellMoveType.Unbreakable:
        break;
      case CellMoveType.SlowsTank:
        if (this.delay == 0) {
          this.delay = 3;
          this.x = newX; this.y = newY;
        } else {
          this.delay--;
        }
        break;
      case CellMoveType.None:
        this.delay = 0;
        this.x = newX; this.y = newY;
        break;
    }

    // Clear under the tank.
    this.grid.clearCell(this.x, this.y, 3, 3);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.grid.drawSprite(ctx, this.x, this.y, this.sprite, 3);
  }
}
