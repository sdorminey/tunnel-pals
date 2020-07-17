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

class Grid:
  def __init__(self, rows, cols):
    self.rows = rows
    self.cols = cols
    self.grid = [CellType(random.randint(0, 2)) for x in range(rows * cols)]
    self._rock_on()
    self.updates = []

  def _rock_on(self):
    for k in range(self.rows * self.cols):
      x = (k % self.cols)/ROCK_SCALE
      y = (k // self.cols)/ROCK_SCALE
      z = noise.pnoise2(x, y, octaves = ROCK_OCTAVES, persistence=ROCK_PERSISTENCE, lacunarity=ROCK_LACUNULARITY, repeatx=self.cols, repeaty=self.rows, base=0)
      if z > ROCK_CUTOFF:
        self.grid[k] = CellType.Rock

  def get_updates(self):
    return self.updates

  def clear_updates(self):
    self.updates.clear()

  def get_cell(self, x: int, y: int) -> CellType:
    if x < 0 or y < 0 or x >= self.cols or y >= self.rows:
      return None
    return self.grid[y * self.rows + x]

  def set_cells(self, x: int, y: int, kind: CellType, w = 1, h = 1):
    for col in range(x, x + w):
      for row in range(y, y + h):
        self.grid[row * self.rows + col] = CellType(kind.value)
        self.updates.append((col, row, kind))

  def set_sprite(self, x: int, y: int, sprite, cols: int):
    for k in range(len(sprite)):
      col = x + k % cols
      row = y + k // cols
      self.grid[row * self.rows + col] = sprite[k]
      self.updates.append((col, row, sprite[k]))

  def can_move_through_box(self, x: int, y: int, w = 1, h = 1) -> MoveType:
    if x < 0 or y < 0 or x+w > self.cols or y+h > self.rows:
      return MoveType.Unbreakable
    return MoveType(max([self.grid[row * self.rows + col].move_type.value for row in range(y, y + h) for col in range(x, x + h)]))
