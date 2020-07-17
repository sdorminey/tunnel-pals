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

  @property
  def sprite(self):
    return {
      TankDirection.Left: [
        CellType.Void, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.Void, CellType.GreenTankBody, CellType.GreenTankBody
      ],

      TankDirection.Right: [
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.Void,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.Void
      ],

      TankDirection.Up: [
        CellType.Void, CellType.GreenTankBody, CellType.Void,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody
      ],

      TankDirection.Down: [
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.Void, CellType.GreenTankBody, CellType.Void
      ],

      TankDirection.UpLeft: [
        CellType.GreenTankBody, CellType.Void, CellType.GreenTankBody,
        CellType.Void, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody
      ],

      TankDirection.DownLeft: [
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.Void, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.Void, CellType.GreenTankBody
      ],

      TankDirection.UpRight: [
        CellType.GreenTankBody, CellType.Void, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.Void,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody
      ],

      TankDirection.DownRight: [
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.GreenTankBody,
        CellType.GreenTankBody, CellType.GreenTankBody, CellType.Void,
        CellType.GreenTankBody, CellType.Void, CellType.GreenTankBody
      ]
    }.get(self)

class MessageType(Enum):
  GameInit = 1
  TankInput = 2
  TankMove = 3
  GridUpdates = 4
  TankShoot = 5