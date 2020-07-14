import { CellType, TankAction } from './game-info';

export default class Sprites {
  public static readonly tankRight: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent
  ];

  public static readonly tankUp: CellType[] = [
    CellType.Transparent, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
  ]

  public static readonly tankLeft: CellType[] = [
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
  ]

  public static readonly tankDown: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.Transparent,
  ]

  public static readonly tankUpLeft: CellType[] = [
    CellType.GreenTankBody, CellType.Transparent, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
  ];

  public static readonly tankUpRight: CellType[] = [
    CellType.GreenTankBody, CellType.Transparent, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
  ];

  public static readonly tankDownLeft: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.Transparent, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.Transparent, CellType.GreenTankBody,
  ];

  public static readonly tankDownRight: CellType[] = [
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
    CellType.GreenTankBody, CellType.GreenTankBody, CellType.Transparent,
    CellType.GreenTankBody, CellType.Transparent, CellType.GreenTankBody,
  ];

  public static getGunOffset(direction: TankAction): [number, number] {
    switch (direction) {
      case TankAction.MoveUp: return [1, 0];
      case TankAction.MoveDown: return [1, 2];
      case TankAction.MoveLeft: return [0, 1];
      case TankAction.MoveRight: return [2, 1];
      case TankAction.MoveUpLeft: return [0, 0];
      case TankAction.MoveUpRight: return [2, 0];
      case TankAction.MoveDownLeft: return [0, 2];
      case TankAction.MoveDownRight: return [2, 2];
    }
  }
}