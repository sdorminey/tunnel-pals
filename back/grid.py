from contract import *
import random
import numpy as np
import noise

# Sacrifice a goat to the RNG gods.
ROCK_SCALE = 25.0
ROCK_OCTAVES = 6
ROCK_PERSISTENCE = 0.5
ROCK_LACUNULARITY = 2.0
ROCK_CUTOFF = 0.25
ROCK_WALL_SIZE = 8

BASE_WIDTH = 16
BASE_HEIGHT = 32
BASE_MARGIN = 8

class Grid:
  """The game grid is a 2D matrix of cells, stored internally in 1D. Updates are tracked for broadcast."""

  def __init__(self, rows, cols):
    self.updates = []
    self.rows = rows
    self.cols = cols
    self.seed = random.randint(0, 25000)
    self.grid = [CellType(random.randint(0, 2)) for x in range(rows * cols)]
    self._rock_on()
    x, y = self._gen_base_coords()
    self.blue_start = (x + BASE_WIDTH // 2, y + BASE_HEIGHT // 2)
    self._create_base(x, y, CellType.BlueWall)
    x, y = self._gen_base_coords()
    self.green_start = (x + BASE_WIDTH // 2, y + BASE_HEIGHT // 2)
    self._create_base(x, y, CellType.GreenWall)
    self.startgrid = self.grid.copy()
    self.clear_updates()

  def _wall_dist(self, x: int, y: int) -> int:
    """Calculate the absolute distance to the nearest wall."""
    return min(min(x, abs(self.cols - x)), min(y, abs(self.rows - y)))

  def _rock_cutoff(self, x: int, y: int) -> float:
    """Determine the probability cutoff for rock generation at a given x/y coords."""
    dist = self._wall_dist(x, y)
    if dist > ROCK_WALL_SIZE:
      return ROCK_CUTOFF
    return -0.5 + 0.75 * (dist / ROCK_WALL_SIZE)

  def _rock_on(self):
    """Generate rocky terrain by thresholding Perlin noise with a dynamic cutoff."""
    for k in range(self.rows * self.cols):
      x = k % self.cols
      y = k // self.cols
      z = noise.pnoise3(x/ROCK_SCALE, y/ROCK_SCALE, self.seed, octaves = ROCK_OCTAVES, persistence=ROCK_PERSISTENCE, lacunarity=ROCK_LACUNULARITY, repeatx=self.cols, repeaty=self.rows, repeatz=25000, base=0)
      if z > self._rock_cutoff(x, y):
        self.grid[k] = CellType.Rock
  
  def _gen_base_coords(self) -> (int, int):
    """Finds candidate x/y coords for a base. Works by surveying to find an area clear of rocks and other bases."""
    while True:
      x = random.randint(ROCK_WALL_SIZE, self.cols - ROCK_WALL_SIZE - BASE_WIDTH)
      y = random.randint(ROCK_WALL_SIZE, self.rows - ROCK_WALL_SIZE - BASE_HEIGHT)
      survey = self.survey_cells(x - BASE_MARGIN, y - BASE_MARGIN, BASE_WIDTH + 2 * BASE_MARGIN, BASE_HEIGHT + 2 * BASE_MARGIN)
      if not CellType.ChargePad in survey and not CellType.BlueWall in survey and not CellType.GreenWall in survey:
        return (x, y)

  def _create_base(self, x: int, y: int, color: CellType):
    """Draws the base into the grid."""
    self.set_cells(x, y, CellType.ChargePad, BASE_WIDTH, BASE_HEIGHT)
    self.set_cells(x, y, color, BASE_WIDTH, 1)
    self.set_cells(x, y, color, 1, BASE_HEIGHT)
    self.set_cells(x, y + BASE_HEIGHT, color, BASE_WIDTH, 1)
    self.set_cells(x + BASE_WIDTH, y, color, 1, BASE_HEIGHT)
    self.set_cells(x + (BASE_WIDTH // 2 - 2), y, CellType.ChargePad, 5, 1)

  def get_updates(self):
    return self.updates

  def clear_updates(self):
    self.updates.clear()

  def get_cell(self, x: int, y: int) -> CellType:
    if x < 0 or y < 0 or x >= self.cols or y >= self.rows:
      return None
    return self.grid[y * self.rows + x]

  def set_cells(self, x: int, y: int, kind: CellType, w = 1, h = 1):
    """Sets the cells in a rectangular area to a particular type."""
    for col in range(x, x + w):
      for row in range(y, y + h):
        self.grid[row * self.rows + col] = CellType(kind.value)
        self.updates.append((col, row, kind))

  def set_sprite(self, x: int, y: int, sprite, cols: int):
    """Draws a sprite onto the grid."""
    for k in range(len(sprite)):
      col = x + k % cols
      row = y + k // cols
      self.grid[row * self.rows + col] = sprite[k]
      self.updates.append((col, row, sprite[k]))

  def can_move_through_box(self, x: int, y: int, w = 1, h = 1) -> MoveType:
    """Surveys the move types of a rectangular area, for collision detection."""
    if x < 0 or y < 0 or x+w > self.cols or y+h > self.rows:
      return MoveType.Unbreakable
    return MoveType(max([self.grid[row * self.rows + col].move_type.value for row in range(y, y + h) for col in range(x, x + h)]))

  def survey_cells(self, x: int, y: int, w = 1, h = 1) -> set(CellType):
    """Surveys a rectangle for the set of cell types in the area."""
    kinds = set()
    for col in range(x, x + w + 1):
      for row in range(y, y + h + 1):
        kinds.add(self.grid[row * self.rows + col])
    return kinds

  def cleanup_after_game(self):
    """Cleans up certain cell types after a game, replacing those with their original values after generation."""
    kindsToClean = set([CellType.BlueTankBody, CellType.GreenTankBody, CellType.Shot])
    for k in range(len(self.grid)):
      if self.grid[k] in kindsToClean:
        self.grid[k] = self.startgrid[k]
        self.updates.append((k % self.cols, k // self.cols, self.grid[k]))