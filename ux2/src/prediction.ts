import GameGrid from "./game-grid";
import { TankDirection } from "./messages";
import Tank from "./tank";
import { GameInfo, CellMoveType } from "./game-info";
import Sprites from "./sprites";

export class Prediction {
  private readonly grid: GameGrid;

  constructor(grid: GameGrid) {
    this.grid = grid;
  }

  public moveTank(tank: Tank, direction: TankDirection): void {
    if (!direction) {
      return;
    }

    tank.direction = direction;
    this.grid.clearCell(tank.x, tank.y, 3, 3);
    const [dX, dY] = GameInfo.getMoveDirection(direction);
    const moveType = this.grid.canMoveThroughBox(tank.x + dX, tank.y + dY, 3, 3);
    const sprite = Sprites.tankSpriteForDirection(tank.direction);
    switch (moveType) {
      case CellMoveType.None:
        tank.x += dX; tank.y += dY;
        break;
      case CellMoveType.Unbreakable:
        break;
      case CellMoveType.SlowsTank:
        {
          if (!tank.delay) {
            tank.delay = 3;
            tank.x += dX; tank.y += dY;
          } else {
            tank.delay--;
          }
          break;
        }
    }

    this.grid.setSprite(tank.x, tank.y, sprite, 3);
  }
}