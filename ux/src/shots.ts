import { TankAction, GameInfo, CellMoveType, CellType } from "./game-info";
import GameGrid from "./game-grid";

class Shot {
  public x: number;
  public y: number;
  public readonly direction: TankAction;

  constructor(x: number, y: number, direction: TankAction) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  public tick(): void {
    var [moveX, moveY] = GameInfo.getMoveDirection(this.direction);
    this.x += moveX; this.y += moveY;
  }
}

export default class Shots {
  private readonly shots: Set<Shot> = new Set<Shot>();

  public add(x: number, y: number, direction: TankAction) {
    this.shots.add(new Shot(x, y, direction));
  }

  public tick(grid: GameGrid): void {
    for (let shot of this.shots) {
      grid.clearCell(shot.x, shot.y);
      shot.tick();
      switch (grid.canMoveThroughBox(shot.x, shot.y)) {
        case CellMoveType.None:
          grid.setCell(shot.x, shot.y, CellType.Shot);
          break;
        case CellMoveType.SlowsTank:
          grid.clearCell(shot.x, shot.y);
          this.shots.delete(shot);
          break;
        case CellMoveType.Unbreakable:
          this.shots.delete(shot);
          break;
      }
    }
  }
}