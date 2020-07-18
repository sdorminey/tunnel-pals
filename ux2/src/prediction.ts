import GameGrid from "./game-grid";
import { TankDirection } from "./messages";
import Tank from "./tank";
import { GameInfo } from "./game-info";
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

    const [dX, dY] = GameInfo.getMoveDirection(direction);
    this.grid.clearCell(tank.x, tank.y, 3, 3);
    tank.x += dX; tank.y += dY;
    tank.direction = direction;
    const sprite = Sprites.tankSpriteForDirection(tank.direction);
    this.grid.setSprite(tank.x, tank.y, sprite, 3);
  }
}