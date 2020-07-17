import asyncio
import websockets
import json

from contract import *
from grid import Grid
from shots import Shots
from tank import Tank

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
          self.tank.nextDirection = TankDirection(message["direction"]) if message["direction"] else None
          self.tank.moving = self.tank.nextDirection
        if message["type"] == MessageType.TankShoot.value:
          self.tank.shooting = True
    finally:
      self.sockets.remove(websocket)

g = Game()
start_server = websockets.serve(g.accept, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().create_task(g.run())
asyncio.get_event_loop().run_forever()