import { TankDirection } from "./messages";

export default class Tank {
  public x = 0;
  public y = 0;
  public hp = 0;
  public power = 0;
  public direction = TankDirection.Right;
  public delay = 0;
}
