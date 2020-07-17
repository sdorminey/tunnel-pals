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
  Hi = 0,
  GridData = 1,
  TankInput,
  TankMove,
  GridUpdates,
  TankShoot,
  Login
}

export class BaseMessage {
  type: MessageType;
}

export class LoginMessage extends BaseMessage {
  tankName: string;
}

export class GridDataMessage extends BaseMessage {
  grid: CellType[];
  rows: number;
  cols: number;
  tankDirection: TankDirection;
  tankX: number;
  tankY: number;
}

export class TankInputMessage extends BaseMessage {
  direction: TankDirection | null;
}

export class TankMoveMessage extends BaseMessage {
  direction: TankDirection;
  x: number;
  y: number;
  hp: number;
}

export class GridUpdatesMessage extends BaseMessage {
  updates: {x: number; y: number; type: CellType}[]
}