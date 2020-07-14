import asyncio
import websockets
import json
import random

class Grid:
  def __init__(self, rows, cols):
    self.rows = rows
    self.cols = cols
    self.grid = [random.randint(0, 2) for x in range(rows * cols)]

class Game:
  def __init__(self):
    self.grid = Grid(128, 128)
    pass

  async def accept(self, websocket, path):
    gridMessage = {
      "type": 1,
      "rows": self.grid.rows,
      "cols": self.grid.cols,
      "grid": self.grid.grid
    }

    await websocket.send(json.dumps(gridMessage))

g = Game()
start_server = websockets.serve(g.accept, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()