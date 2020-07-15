import { TankAction } from './game-info';
import { TankDirection } from './messages';

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

  public getTankDirection(): TankDirection | null {
    switch (this.keyboardState & 15) {
      case KeyboardState.None:
        return null;

      // Cardinal directions:
      case KeyboardState.Left:
        return TankDirection.Left;
      case KeyboardState.Right:
        return TankDirection.Right;
      case KeyboardState.Up:
        return TankDirection.Up;
      case KeyboardState.Down:
        return TankDirection.Down;

      // Diagonal directions:
      case KeyboardState.Left | KeyboardState.Up:
        return TankDirection.UpLeft;
      case KeyboardState.Up | KeyboardState.Right:
        return TankDirection.UpRight;
      case KeyboardState.Down | KeyboardState.Left:
        return TankDirection.DownLeft;
      case KeyboardState.Down | KeyboardState.Right:
        return TankDirection.DownRight;
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
