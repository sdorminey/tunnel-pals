import asyncio
import websockets
import json

from contract import *
from grid import Grid
from shots import Shots
from tank import Tank

class Session:
  def __init__(self, websocket: websockets.WebSocketServerProtocol, tank: Tank):
    self.socket = websocket
    self.tank = tank

  async def update(self, moved: bool, updates):
    if updates:
      await self.socket.send(json.dumps({
        "type": MessageType.GridUpdates.value,
        "updates": [{
          "x": x,
          "y": y,
          "type": kind.value
        } for (x, y, kind) in updates]
      }))

    if moved:
      await self.socket.send(json.dumps({
        "type": MessageType.TankMove.value,
        "x": self.tank.x,
        "y": self.tank.y,
        "direction": self.tank.direction.value,
        "hp": self.tank.hp,
        "power": self.tank.power
      }))

class Game:
  def __init__(self):
    self.grid = Grid(128, 128)
    self.greenTank = Tank(CellType.GreenTankBody, self.grid.green_start)
    self.blueTank = Tank(CellType.BlueTankBody, self.grid.blue_start)
    self.shots = Shots(self.grid)
    self.sessions = []
  
  async def run(self):
    while True:
      moved = False
      self.shots.tick()
      greenHits, blueHits = self.shots.get_hits()
      self.greenTank.hits = greenHits
      self.blueTank.hits = blueHits
      self.shots.clear_hits()

      for tank in [self.greenTank, self.blueTank]:
        tank.tick(self.grid)
        moved = moved or tank.has_update()
        if tank.shooting:
          tank.shooting = False
          dX, dY = tank.state.direction.gunOffset
          self.shots.add_shot(tank.x + dX, tank.y + dY, tank.direction)

      updates = self.grid.get_updates()
      for session in self.sessions:
        await session.update(moved, updates)
      updates.clear()
      await asyncio.sleep(0.025)

  async def accept(self, websocket : websockets.WebSocketServerProtocol, path: str):
    await websocket.send(json.dumps({
      "type": MessageType.Hi.value
    }))

    loginMsg = json.loads(await websocket.recv())
    tank = self.blueTank if loginMsg["tankName"] == "#blue" else self.greenTank
    s = Session(websocket, tank)
    self.sessions.append(s)
    try:
      gridMessage = {
        "type": MessageType.GameInit.value,
        "rows": self.grid.rows,
        "cols": self.grid.cols,
        "grid": [g.value for g in self.grid.grid]
      }

      await websocket.send(json.dumps(gridMessage))

      await s.update(True, None)

      while True:
        message = json.loads(await websocket.recv())
        if message["type"] == MessageType.TankInput.value:
          s.tank.nextDirection = TankDirection(message["direction"]) if "direction" in message and message["direction"] else None
          s.tank.moving = s.tank.nextDirection
        if message["type"] == MessageType.TankShoot.value:
          s.tank.shooting = True
    finally:
      self.sessions.remove(s)

g = Game()
start_server = websockets.serve(g.accept, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().create_task(g.run())
asyncio.get_event_loop().run_forever()