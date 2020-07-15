import asyncio
import websockets
import json
import random
from enum import Enum

class Grid:
  def __init__(self, rows, cols):
    self.rows = rows
    self.cols = cols
    self.grid = [random.randint(0, 2) for x in range(rows * cols)]

class TankDirection(Enum):
  Left = 1
  Right = 2
  Up = 3
  Down = 4
  UpLeft = 5
  UpRight = 6
  DownLeft = 7
  DownRight = 8

def delta(dir: TankDirection):
  deltas = {
    TankDirection.Left.value: (-1, 0),
    TankDirection.Right.value: (1, 0),
    TankDirection.Up.value: (0, -1),
    TankDirection.Down.value: (0, 1),
    TankDirection.UpLeft.value: (-1, -1),
    TankDirection.DownLeft.value: (-1, 1),
    TankDirection.UpRight.value: (1, -1),
    TankDirection.DownRight.value: (1, 1)
  }
  return deltas[dir]

class MessageType(Enum):
  GameInit = 1
  TankInput = 2
  TankMove = 3

class Tank:
  def __init__(self):
    self.x = 0
    self.y = 0
    self.direction = TankDirection.Right.value
    self.moving = False
  
  def tick(self):
    if not self.moving:
      return
    dX, dY = delta(self.direction)
    self.x += dX; self.y += dY

class Game:
  def __init__(self):
    self.grid = Grid(128, 128)
    self.tank = Tank()
    self.sockets = []
  
  async def run(self):
    while True:
      self.tank.tick()
      for socket in self.sockets:
        await socket.send(json.dumps({
          "type": MessageType.TankMove.value,
          "x": self.tank.x,
          "y": self.tank.y,
          "direction": self.tank.direction
        }))
      await asyncio.sleep(0.025)

  async def accept(self, websocket : websockets.WebSocketServerProtocol, path):
    self.sockets.append(websocket)
    try:
      gridMessage = {
        "type": MessageType.GameInit.value,
        "rows": self.grid.rows,
        "cols": self.grid.cols,
        "grid": self.grid.grid,
        "tankX": self.tank.x,
        "tankY": self.tank.y,
        "tankDirection": self.tank.direction
      }

      await websocket.send(json.dumps(gridMessage))
      while True:
        message = json.loads(await websocket.recv())
        if message["type"] == MessageType.TankInput.value:
          if message["direction"]:
            self.tank.direction = message["direction"]
          self.tank.moving = message["moving"]
    finally:
      self.sockets.remove(websocket)

g = Game()
start_server = websockets.serve(g.accept, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().create_task(g.run())
asyncio.get_event_loop().run_forever()