import asyncio
import websockets
import json
import logging

from typing import List
from contract import *
from grid import Grid
from shots import Shots
from tank import Tank
from session import Session

class Game:
  def __init__(self, grid: Grid):
    self.grid = grid
    self.shots = Shots(self.grid)
    self.greenTank = Tank(CellType.GreenTankBody, self.grid.green_start)
    self.blueTank = Tank(CellType.BlueTankBody, self.grid.blue_start)

  async def run_frame(self, sessions: List[Session]):
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
    for session in sessions:
      try:
        if updates:
          await session.send_gridupdates(updates)
        if moved:
          await session.send_tankmove(self.blueTank if session.isBlue else self.greenTank)
      except:
        logging.warn("Error pushing to client!")
    updates.clear()

  async def on_session_join(self, session):
    await session.send_grid(self.grid)
    await session.send_tankmove(self.blueTank if session.isBlue else self.greenTank)

  def receive(self, session, message):
    tank = self.blueTank if session.isBlue else self.greenTank
    if message["type"] == MessageType.TankInput.value:
      tank.nextDirection = TankDirection(message["direction"]) if "direction" in message and message["direction"] else None
      tank.moving = tank.nextDirection
    if message["type"] == MessageType.TankShoot.value:
      tank.shooting = True

class Match:
  def __init__(self):
    logging.info("Generating grid..")
    self.grid = Grid(512, 512)
    logging.info("Grid generation complete!")
    self.sessions = []
    self.game = Game(self.grid)

  async def run(self):
    while True:
      await self.game.run_frame(self.sessions)
      await asyncio.sleep(0.025)

  async def process_session(self, session: Session):
    await self.game.on_session_join(session)
    self.sessions.append(session)
    try:
      while True:
        message = await session.receive()
        self.game.receive(session, message)
    finally:
      self.sessions.remove(session)

class Server:
  def __init__(self):
    self.match = Match()

  async def run(self):
    await self.match.run()

  async def accept(self, ws: websockets.WebSocketServerProtocol, path: str):
    logging.info("Someone joined the game!")
    await ws.send(json.dumps({
      "type": MessageType.Hi.value
    }))

    loginMsg = json.loads(await ws.recv())
    isBlue = loginMsg["tankName"] == "#blue"
    session = Session(ws, isBlue)
    try:
      await self.match.process_session(session)
    finally:
      logging.info("Session is over.")

FORMAT = "%(asctime)-15s [%(levelname)s] %(message)s"
logging.basicConfig(format=FORMAT, level=logging.INFO)
logging.info("Started logging.")
s = Server()
start_server = websockets.serve(s.accept, "0.0.0.0", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().create_task(s.run())
asyncio.get_event_loop().run_forever()