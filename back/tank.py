from contract import *
from grid import Grid

MAX_REAL_POWER = 4800
MAX_POWER = 100
CHARGE_PER_TICK = 5
DRAIN_PER_TICK = 1
DRAIN_FROM_MOVING = 5
DRAIN_FROM_SHOOTING = 10

class TankState:
  def __init__(self, other = None):
    if other:
      self.x = other.x
      self.y = other.y
      self.direction = other.direction
      self.hp = other.hp
      self.power = other.power
    else:
      self.x = 64
      self.y = 64
      self.direction = TankDirection.Right
      self.hp = 100
      self.power = 100
  
  def __eq__(self, other) -> bool:
    return other and self.x == other.x and self.y == other.y and self.direction == other.direction and self.hp == other.hp and self.power == other.power

class Tank:
  def __init__(self, color: CellType, xy: (int, int)):
    self.state = TankState()
    x, y = xy
    self.state.x = x
    self.state.y = y
    self.prevState = None
    self.nextDirection = None
    self.moving = False
    self.delay = 0
    self.shooting = False
    self.color = color
    self.hits = 0
    self.realpower = MAX_REAL_POWER
  
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

  @property
  def power(self) -> int:
    return self.state.power

  def tick(self, grid : Grid):
    self.prevState = self.state
    self.state = TankState(self.prevState)
    if self.nextDirection:
      self.state.direction = self.nextDirection
    
    if self.hits:
      self.state.hp -= 10 * self.hits
      self.hits = 0

    charging = CellType.ChargePad in grid.survey_cells(self.x - 1, self.y - 1, 4, 4)
    if charging:
      self.realpower = min(self.realpower + CHARGE_PER_TICK, MAX_REAL_POWER)
    else:
      self.realpower -= DRAIN_PER_TICK
    
    if self.shooting:
      self.realpower -= DRAIN_FROM_SHOOTING

    if self.moving:
      grid.set_cells(self.x, self.y, CellType.Void, 3, 3)
      dX, dY = self.state.direction.delta
      moveKind = grid.can_move_through_box(self.state.x + dX, self.state.y + dY, 3, 3)

      if moveKind == MoveType.Free:
        self.state.x += dX; self.state.y += dY

      if moveKind == MoveType.Slow:
        if not self.delay:
          self.delay = 3
          self.state.x += dX; self.state.y += dY
          self.realpower -= DRAIN_FROM_MOVING
        else:
          self.delay -= 1
      
      grid.set_sprite(self.state.x, self.state.y, Sprites.tank(self.state.direction, self.color), 3)

    self.state.power = (self.realpower * MAX_POWER) // MAX_REAL_POWER