import json
import websockets
from contract import MessageType
from tank import Tank
from grid import Grid
from typing import List, Tuple

class Session:
  def __init__(self, socket: websockets.WebSocketServerProtocol, isBlue: bool):
    self.socket = socket
    self.isBlue = isBlue

  async def receive(self):
    return json.loads(await self.socket.recv())

  async def send_hi(self):
    await self.socket.send(json.dumps({
      "type": MessageType.Hi.value
    }))

  async def send_grid(self, grid: Grid):
    await self.socket.send(json.dumps({
      "type": MessageType.GameInit.value,
      "rows": grid.rows,
      "cols": grid.cols,
      "grid": [g.value for g in grid.grid]
    }))

  async def send_gridupdates(self, updates: List[Tuple[int, int, int]]):
    await self.socket.send(json.dumps({
      "type": MessageType.GridUpdates.value,
      "updates": [{
        "x": x,
        "y": y,
        "type": kind.value
      } for (x, y, kind) in updates]
    }))

  async def send_tankmove(self, tank: Tank):
    await self.socket.send(json.dumps({
      "type": MessageType.TankMove.value,
      "x": tank.x,
      "y": tank.y,
      "direction": tank.direction.value,
      "hp": tank.hp,
      "power": tank.power
    }))
