import { CellType } from "./game-info"

export enum TankDirection {
  Left = 1,
  Right,
  Up,
  Down,
  UpLeft,
  UpRight,
  DownLeft,
  DownRight
}

export enum MessageType {
  GridData = 1,
  TankInput,
  TankMove,
  GridUpdates
}

export class BaseMessage {
  type: MessageType;
}

export class GridDataMessage extends BaseMessage {
  grid: CellType[];
  rows: number;
  cols: number;
}

export class TankInputMessage extends BaseMessage {
  direction: TankDirection;
  moving: boolean;
}

export class TankMoveMessage extends BaseMessage {
  direction: TankDirection;
  x: number;
  y: number;
}

export class GridUpdatesMessage extends BaseMessage {
  updates: {x: number; y: number; kind: CellType}[]
}