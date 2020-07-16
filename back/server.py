import asyncio
import websockets
import json
import random
from enum import Enum

class MoveType(Enum):
  Free = 0
  Slow = 1
  Unbreakable = 2

class CellType(Enum):
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

class Grid:
  def __init__(self, rows, cols):
    self.rows = rows
    self.cols = cols
    self.grid = [CellType(random.randint(0, 2)) for x in range(rows * cols)]
    self.updates = []

  def get_updates(self):
    return self.updates

  def clear_updates(self):
    self.updates.clear()

  def set_cells(self, x: int, y: int, kind: CellType, w = 1, h = 1):
    for col in range(x, x + w):
      for row in range(y, y + h):
        self.grid[row * self.rows + col] = CellType(kind.value)
        self.updates.append((col, row, kind))
  
  def can_move_through_box(self, x: int, y: int, w = 1, h = 1) -> MoveType:
    if x < 0 or y < 0 or x+w > self.cols or y+h > self.rows:
      return MoveType.Unbreakable
    return MoveType(max([self.grid[row * self.rows + col].move_type.value for row in range(y, y + h) for col in range(x, x + h)]))

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

class MessageType(Enum):
  GameInit = 1
  TankInput = 2
  TankMove = 3
  GridUpdates = 4
  TankShoot = 5

class Shot:
  def __init__(self, x: int, y: int, direction : TankDirection):
    self.x = x
    self.y = y
    self.direction = direction
  
  def tick(self, grid: Grid):
    grid.set_cells(self.x, self.y, CellType.Void)
    dX, dY = self.direction.delta
    self.x += dX; self.y += dY
    moveType = grid.can_move_through_box(self.x, self.y)
    if moveType == MoveType.Free:
      grid.set_cells(self.x, self.y, CellType.Shot)
      return True
    if moveType == MoveType.Slow:
      grid.set_cells(self.x, self.y, CellType.Void)
      return False
    return False
  
class Shots:
  def __init__(self, grid : Grid):
    self.shots = set()
    self.grid = grid

  def add_shot(self, x: int, y: int, direction: TankDirection):
    self.shots.add(Shot(x, y, direction))
  
  def tick(self):
    dead = set()
    for shot in self.shots:
      if not shot.tick(self.grid):
        dead.add(shot)
    for shot in dead:
      self.shots.remove(shot)

class Tank:
  def __init__(self):
    self.x = 0
    self.y = 0
    self.direction = TankDirection.Right
    self.moving = False
    self.delay = 0
    self.shooting = False
  
  def tick(self, grid : Grid):
    if not self.moving:
      return

    dX, dY = self.direction.delta
    moveKind = grid.can_move_through_box(self.x + dX, self.y + dY, 3, 3)

    if moveKind == MoveType.Free:
      self.x += dX; self.y += dY
      grid.set_cells(self.x, self.y, CellType.Void, 3, 3)
      return True

    if moveKind == MoveType.Slow:
      if not self.delay:
        self.delay = 3
        self.x += dX; self.y += dY
        grid.set_cells(self.x, self.y, CellType.Void, 3, 3)
        return True
      else:
        self.delay -= 1
    
    return False

class Game:
  def __init__(self):
    self.grid = Grid(128, 128)
    self.tank = Tank()
    self.shots = Shots(self.grid)
    self.sockets = []
  
  async def run(self):
    while True:
      moved = self.tank.tick(self.grid)
      if self.tank.shooting:
        self.tank.shooting = False
        dX, dY = self.tank.direction.gunOffset
        self.shots.add_shot(self.tank.x + dX, self.tank.y + dY, self.tank.direction)

      self.shots.tick()
      updates = self.grid.get_updates()
      for socket in self.sockets:
        if updates:
          await socket.send(json.dumps({
            "type": MessageType.GridUpdates.value,
            "updates": [{
              "x": x,
              "y": y,
              "type": kind.value
            } for (x, y, kind) in updates]
          }))

        if moved:
            await socket.send(json.dumps({
              "type": MessageType.TankMove.value,
              "x": self.tank.x,
              "y": self.tank.y,
              "direction": self.tank.direction.value
            }))
      updates.clear()
      await asyncio.sleep(0.025)

  async def accept(self, websocket : websockets.WebSocketServerProtocol, path):
    self.sockets.append(websocket)
    try:
      gridMessage = {
        "type": MessageType.GameInit.value,
        "rows": self.grid.rows,
        "cols": self.grid.cols,
        "grid": [g.value for g in self.grid.grid],
        "tankX": self.tank.x,
        "tankY": self.tank.y,
        "tankDirection": self.tank.direction.value
      }

      await websocket.send(json.dumps(gridMessage))
      while True:
        message = json.loads(await websocket.recv())
        if message["type"] == MessageType.TankInput.value:
          if message["direction"]:
            self.tank.direction = TankDirection(message["direction"])
          self.tank.moving = message["moving"]
        if message["type"] == MessageType.TankShoot.value:
          self.tank.shooting = True
    finally:
      self.sockets.remove(websocket)

g = Game()
start_server = websockets.serve(g.accept, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().create_task(g.run())
asyncio.get_event_loop().run_forever()