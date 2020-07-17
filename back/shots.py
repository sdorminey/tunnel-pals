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

