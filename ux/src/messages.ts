import { CellType } from "./game-info"

export enum MessageType {
  GridData = 1
}

export type BaseMessage = {
  type: MessageType;
}

export type GridDataMessage = {
  type: MessageType;
  grid: CellType[];
  rows: number;
  cols: number;
}