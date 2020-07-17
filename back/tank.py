from contract import *
from grid import Grid

class Tank:
  def __init__(self, color: CellType):
    self.x = 0
    self.y = 0
    self.direction = TankDirection.Right
    self.nextDirection = None
    self.moving = False
    self.delay = 0
    self.shooting = False
    self.color = color

  def tick(self, grid : Grid):
    directionChanged = self.nextDirection and self.direction != self.nextDirection
    if self.nextDirection:
      self.direction = self.nextDirection
    if not self.moving:
      return directionChanged

    grid.set_cells(self.x, self.y, CellType.Void, 3, 3)
    dX, dY = self.direction.delta
    moveKind = grid.can_move_through_box(self.x + dX, self.y + dY, 3, 3)

    try:
      if moveKind == MoveType.Free:
        self.x += dX; self.y += dY
        return True

      if moveKind == MoveType.Slow:
        if not self.delay:
          self.delay = 3
          self.x += dX; self.y += dY
          return True
        else:
          self.delay -= 1
      
      return directionChanged
    finally:
      grid.set_sprite(self.x, self.y, Sprites.tank(self.direction, self.color), 3)

