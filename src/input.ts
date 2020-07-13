import { TankAction } from './game-info';

enum KeyboardState {
  None = 0,
  Up = 1,
  Left = 2,
  Down = 4,
  Right = 8
}

export class InputController {
  private keyboardState = KeyboardState.None;

  public getInputAction(): TankAction | null {
    switch (this.keyboardState) {
      case KeyboardState.None:
        return null;
      case KeyboardState.Left:
        return TankAction.MoveLeft;
      case KeyboardState.Right:
        return TankAction.MoveRight;
      case KeyboardState.Up:
        return TankAction.MoveUp;
      case KeyboardState.Down:
        return TankAction.MoveDown;
    }
  }

  public receiveInput(event: KeyboardEvent): void {
    if (event.repeat) {
      return;
    }

    if (event.keyCode == 188) { // W
      this.keyboardState ^= KeyboardState.Up;
    }

    if (event.keyCode == 65) { // A
      this.keyboardState ^= KeyboardState.Left;
    }

    if (event.keyCode == 79) { // S
      this.keyboardState ^= KeyboardState.Down;
    }

    if (event.keyCode == 69) { // D
      this.keyboardState ^= KeyboardState.Right;
    }
  }
}
