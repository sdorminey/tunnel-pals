from contract import *
from grid import Grid

class TankState:
  def __init__(self, other = None):
    if other:
      self.x = other.x
      self.y = other.y
      self.direction = other.direction
      self.hp = other.hp
    else:
      self.x = 0
      self.y = 0
      self.direction = TankDirection.Right
      self.hp = 100
  
  def __eq__(self, other) -> bool:
    return other and self.x == other.x and self.y == other.y and self.direction == other.direction and self.hp == other.hp

class Tank:
  def __init__(self, color: CellType):
    self.state = TankState()
    self.prevState = None
    self.nextDirection = None
    self.moving = False
    self.delay = 0
    self.shooting = False
    self.color = color
    self.hits = 0
  
  def has_update(self) -> bool:
    return self.state != self.prevState

  @property
  def x(self) -> int:
    return self.state.x

  @property
  def y(self) -> int:
    return self.state.y

  @property
  def direction(self) -> TankDirection:
    return self.state.direction

  @property
  def hp(self) -> int:
    return self.state.hp

  def tick(self, grid : Grid):
    self.prevState = self.state
    self.state = TankState(self.prevState)
    if self.nextDirection:
      self.state.direction = self.nextDirection
    
    if self.hits:
      self.state.hp -= 10 * self.hits
      self.hits = 0

    if not self.moving:
      return

    grid.set_cells(self.x, self.y, CellType.Void, 3, 3)
    dX, dY = self.state.direction.delta
    moveKind = grid.can_move_through_box(self.state.x + dX, self.state.y + dY, 3, 3)

    if moveKind == MoveType.Free:
      self.state.x += dX; self.state.y += dY

    if moveKind == MoveType.Slow:
      if not self.delay:
        self.delay = 3
        self.state.x += dX; self.state.y += dY
      else:
        self.delay -= 1
    
    grid.set_sprite(self.state.x, self.state.y, Sprites.tank(self.state.direction, self.color), 3)