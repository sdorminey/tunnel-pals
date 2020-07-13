import { CellType } from './game-info';

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
}