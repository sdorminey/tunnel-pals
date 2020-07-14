export enum CellType {
  Transparent = -1,
  Void = 0,
  LightSand = 1,
  DarkSand = 2,
  GreenTankBody = 3,
  Shot
}

export enum CellMoveType {
  None,
  SlowsTank,
  Unbreakable
}

export enum TankAction {
  MoveLeft = 1,
  MoveRight,
  MoveUp,
  MoveDown,
  MoveUpLeft,
  MoveUpRight,
  MoveDownLeft,
  MoveDownRight
}

export class GameInfo {
  public static moveTypeForCell(type: CellType): CellMoveType {
    switch (type) {
      case CellType.Void:
        return CellMoveType.None;
      default:
        return CellMoveType.SlowsTank;
    }
  }

  public static colorForCell(type: CellType): string {
    switch (type) {
      case CellType.Void:
        return "#000000";
      case CellType.LightSand:
        return "#fc9003";
      case CellType.DarkSand:
        return "#7d4700";
      case CellType.GreenTankBody:
        return "#00ff00";
      case CellType.Shot:
        return "#ff0000";
    }
  }

  public static getMoveDirection(dir: TankAction): [number, number] {
    switch (dir) {
      case TankAction.MoveUp: return [0, -1];
      case TankAction.MoveDown: return [0, 1];
      case TankAction.MoveRight: return [1, 0];
      case TankAction.MoveLeft: return [-1, 0];
      case TankAction.MoveDownLeft: return [-1, 1];
      case TankAction.MoveDownRight: return [1, 1];
      case TankAction.MoveUpLeft: return [-1, -1];
      case TankAction.MoveUpRight: return [1, -1];
      default:
        return [0, 0];
    }
  }
}
