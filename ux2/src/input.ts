import { TankAction } from './game-info';

enum KeyboardState {
  None = 0,
  Up = 1,
  Left = 2,
  Down = 4,
  Right = 8,
  Shooting = 16
}

export class InputController {
  private keyboardState = KeyboardState.None;

  public getTankAction(): TankAction | null {
    switch (this.keyboardState & 15) {
      case KeyboardState.None:
        return null;

      // Cardinal directions:
      case KeyboardState.Left:
        return TankAction.MoveLeft;
      case KeyboardState.Right:
        return TankAction.MoveRight;
      case KeyboardState.Up:
        return TankAction.MoveUp;
      case KeyboardState.Down:
        return TankAction.MoveDown;

      // Diagonal directions:
      case KeyboardState.Left | KeyboardState.Up:
        return TankAction.MoveUpLeft;
      case KeyboardState.Up | KeyboardState.Right:
        return TankAction.MoveUpRight;
      case KeyboardState.Down | KeyboardState.Left:
        return TankAction.MoveDownLeft;
      case KeyboardState.Down | KeyboardState.Right:
        return TankAction.MoveDownRight;
    }
  }

  public isShooting(): boolean {
    return !!(this.keyboardState & KeyboardState.Shooting);
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

    if (event.keyCode == 32) {
      this.keyboardState ^= KeyboardState.Shooting;
    }
  }
}
