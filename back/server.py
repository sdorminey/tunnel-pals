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
  """A game lasts until one of the players dies."""

  def __init__(self, grid: Grid):
    self.grid = grid
    self.shots = Shots(self.grid)
    self.greenTank = Tank(CellType.GreenTankBody, self.grid.green_start)
    self.blueTank = Tank(CellType.BlueTankBody, self.grid.blue_start)

  async def run_frame(self, sessions: List[Session]):
    """Runs a single tick of the game."""

    moved = False

    # Tick all the shots, and assign hits to the tanks that got hit.
    self.shots.tick()
    greenHits, blueHits = self.shots.get_hits()
    self.greenTank.hits = greenHits
    self.blueTank.hits = blueHits
    self.shots.clear_hits()

    for tank in [self.greenTank, self.blueTank]:
      # Tick each tank. If it moved we need to broadcast the tanks' locations.
      tank.tick(self.grid)
      moved = moved or tank.has_update()
      # If the tank was flagged as shooting, unlatch the flag and add the shot.
      if tank.shooting:
        tank.shooting = False
        dX, dY = tank.state.direction.gunOffset
        self.shots.add_shot(tank.x + dX, tank.y + dY, tank.direction)

    # Send grid updates and tank coord updates to each session.
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
    # Send the grid and the current tank x/y/direction.
    await session.send_grid(self.grid)
    await session.send_tankmove(self.blueTank if session.isBlue else self.greenTank)

  def receive(self, session, message):
    """Receives messages dispatched from the client's session to the game."""

    tank = self.blueTank if session.isBlue else self.greenTank

    # On TankInput, flag the tank so it moves where the player wants it to.
    if message["type"] == MessageType.TankInput.value:
      tank.nextDirection = TankDirection(message["direction"]) if "direction" in message and message["direction"] else None
      tank.moving = tank.nextDirection

    # On TankShoot, flag the tank as shooting.
    if message["type"] == MessageType.TankShoot.value:
      tank.shooting = True

class Match:
  """A match holds sessions sharing a grid to shoot at each other. Matches last for multiple games."""

  def __init__(self):
    logging.info("Generating grid..")
    self.grid = Grid(512, 512)
    logging.info("Grid generation complete!")
    self.sessions = []
    self.game = Game(self.grid)

  async def run(self):
    while True:
      # Tick the game every 25ms.
      await self.game.run_frame(self.sessions)
      await asyncio.sleep(0.025)

  async def process_session(self, session: Session):
    """Handles the entire lifetime of a session."""

    # Have the game send grid and tank location.
    await self.game.on_session_join(session)

    # Keep the session in the broadcast list and dispatch messages, for as long as it's alive.
    self.sessions.append(session)
    try:
      while True:
        message = await session.receive()
        self.game.receive(session, message)
    finally:
      self.sessions.remove(session)

class Server:
  """Server is the entry class, accepting websockets and running the matches."""

  def __init__(self):
    self.match = Match()

  async def run(self):
    """Run the main tick loop for the match."""
    await self.match.run()

  async def accept(self, ws: websockets.WebSocketServerProtocol, path: str):
    """Accept is called whenever a new client connects over websocket."""

    logging.info("Someone joined the game!")

    # Send a Hi message to induce the client to send the login message.
    await ws.send(json.dumps({
      "type": MessageType.Hi.value
    }))

    # Expect the login message, and get the tank (blue or green) from it.
    loginMsg = json.loads(await ws.recv())
    isBlue = loginMsg["tankName"] == "#blue"
    session = Session(ws, isBlue)
    try:
      # Add the session to the Match, which runs until the match ends or the client disconnects.
      await self.match.process_session(session)
    finally:
      logging.info("Session is over.")

# Actual entry point:
if __name__ == "__main__":
  FORMAT = "%(asctime)-15s [%(levelname)s] %(message)s"
  logging.basicConfig(format=FORMAT, level=logging.INFO)
  logging.info("Started logging.")
  s = Server()
  start_server = websockets.serve(s.accept, "0.0.0.0", 8765)

  asyncio.get_event_loop().run_until_complete(start_server)
  asyncio.get_event_loop().create_task(s.run())
  asyncio.get_event_loop().run_forever()