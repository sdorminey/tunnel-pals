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
    const [dX, dY] = GameInfo.getMoveDirection(direction);
    const moveType = this.grid.canMoveThroughBox(tank.x + dX, tank.y + dY, 3, 3);
    switch (moveType) {
      case CellMoveType.Unbreakable:
        return;
      case CellMoveType.SlowsTank:
        {
          if (!tank.delay) {
            tank.delay = 3;
            break;
          } else {
            tank.delay--;
            return;
          }
        }
    }
    this.grid.clearCell(tank.x, tank.y, 3, 3);
    tank.x += dX; tank.y += dY;
    const sprite = Sprites.tankSpriteForDirection(tank.direction);
    this.grid.setSprite(tank.x, tank.y, sprite, 3);
  }
}