from enum import Enum

class MoveType(Enum):
  Free = 0
  Slow = 1
  Unbreakable = 2

class CellType(Enum):
  Trans = -1
  Void = 0
  LightSand = 1
  DarkSand = 2
  GreenTankBody = 3
  Shot = 4
  BlueTankBody = 5
  Rock = 6

  @property
  def move_type(self):
    t = {
      CellType.Void: MoveType.Free,
      CellType.LightSand: MoveType.Slow,
      CellType.DarkSand: MoveType.Slow
    }.get(self) 
    return t if t else MoveType.Unbreakable

class TankDirection(Enum):
  Left = 1
  Right = 2
  Up = 3
  Down = 4
  UpLeft = 5
  UpRight = 6
  DownLeft = 7
  DownRight = 8

  @property
  def delta(self):
    return {
      TankDirection.Left: (-1, 0),
      TankDirection.Right: (1, 0),
      TankDirection.Up: (0, -1),
      TankDirection.Down: (0, 1),
      TankDirection.UpLeft: (-1, -1),
      TankDirection.DownLeft: (-1, 1),
      TankDirection.UpRight: (1, -1),
      TankDirection.DownRight: (1, 1)
    }.get(self)

  @property
  def gunOffset(self):
    return {
      TankDirection.Left: (0, 1),
      TankDirection.Right: (2, 1),
      TankDirection.Up: (1, 0),
      TankDirection.Down: (1, 2),
      TankDirection.UpLeft: (0, 0),
      TankDirection.DownLeft: (0, 2),
      TankDirection.UpRight: (2, 0),
      TankDirection.DownRight: (2, 2)
    }.get(self)

class Sprites:
  @staticmethod
  def tank(direction: TankDirection, color: CellType):
    return {
      TankDirection.Left: [
        CellType.Void, color, color,
        color, color, color,
        CellType.Void, color, color
      ],

      TankDirection.Right: [
        color, color, CellType.Void,
        color, color, color,
        color, color, CellType.Void
      ],

      TankDirection.Up: [
        CellType.Void, color, CellType.Void,
        color, color, color,
        color, color, color
      ],

      TankDirection.Down: [
        color, color, color,
        color, color, color,
        CellType.Void, color, CellType.Void
      ],

      TankDirection.UpLeft: [
        color, CellType.Void, color,
        CellType.Void, color, color,
        color, color, color
      ],

      TankDirection.DownLeft: [
        color, color, color,
        CellType.Void, color, color,
        color, CellType.Void, color
      ],

      TankDirection.UpRight: [
        color, CellType.Void, color,
        color, color, CellType.Void,
        color, color, color
      ],

      TankDirection.DownRight: [
        color, color, color,
        color, color, CellType.Void,
        color, CellType.Void, color
      ]
    }.get(direction)


class MessageType(Enum):
  Hi = 0
  GameInit = 1
  TankInput = 2
  TankMove = 3
  GridUpdates = 4
  TankShoot = 5