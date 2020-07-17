from contract import *
from grid import Grid

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
      return (True, None)
    if moveType == MoveType.Slow:
      grid.set_cells(self.x, self.y, CellType.Void)
      return (False, None)
    return (False, grid.get_cell(self.x, self.y))
  
class Shots:
  def __init__(self, grid : Grid):
    self.shots = set()
    self.grid = grid
    self.blueHits = 0
    self.greenHits = 0

  def add_shot(self, x: int, y: int, direction: TankDirection):
    self.shots.add(Shot(x, y, direction))

  def clear_hits(self):
    self.blueHits = 0
    self.greenHits = 0
  
  def get_hits(self):
    return (self.greenHits, self.blueHits)
  
  def tick(self):
    dead = set()
    for shot in self.shots:
      active, target = shot.tick(self.grid)
      if not active:
        dead.add(shot)
      if target == CellType.BlueTankBody:
        self.blueHits += 1
      if target == CellType.GreenTankBody:
        self.greenHits += 1
    for shot in dead:
      self.shots.remove(shot)

