import { TankDirection } from "./messages";

export enum CellType {
  Transparent = -1,
  Void = 0,
  LightSand = 1,
  DarkSand = 2,
  GreenTankBody = 3,
  Shot = 4,
  BlueTankBody = 5,
  Rock = 6,
  ChargePad = 7,
  GreenWall = 8,
  BlueWall = 9
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
      case CellType.ChargePad:
        return CellMoveType.None;
      case CellType.LightSand:
      case CellType.DarkSand:
        return CellMoveType.SlowsTank;
      default:
        return CellMoveType.Unbreakable;
    }
  }

  public static colorForCell(type: CellType): string {
    switch (type) {
      case CellType.ChargePad:
      case CellType.Void:
        return "#000000";
      case CellType.LightSand:
        return "#fc9003";
      case CellType.DarkSand:
        return "#7d4700";
      case CellType.GreenWall:
      case CellType.GreenTankBody:
        return "#00ff00";
      case CellType.Shot:
        return "#ff0000";
      case CellType.BlueWall:
      case CellType.BlueTankBody:
        return "#0000ff";
      case CellType.Rock:
        return "#cccccc";
    }
  }

  public static getMoveDirection(dir: TankDirection): [number, number] {
    switch (dir) {
      case TankDirection.Up: return [0, -1];
      case TankDirection.Down: return [0, 1];
      case TankDirection.Right: return [1, 0];
      case TankDirection.Left: return [-1, 0];
      case TankDirection.DownLeft: return [-1, 1];
      case TankDirection.DownRight: return [1, 1];
      case TankDirection.UpLeft: return [-1, -1];
      case TankDirection.UpRight: return [1, -1];
      default:
        return [0, 0];
    }
  }
}
