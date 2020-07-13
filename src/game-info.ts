export enum CellType {
  Transparent = -1,
  Void = 0,
  LightSand = 1,
  DarkSand = 2,
  GreenTankBody = 3
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
  MoveDown
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
    }
  }
}
