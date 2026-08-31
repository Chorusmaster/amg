import Vector2 from "../vector2";

export default class AABB {
  public min: Vector2;
  public max: Vector2;

  constructor(
    min: Vector2,
    max: Vector2
  ) {
    this.min = min;
    this.max = max;
  }

  get width() {
    return this.max.x - this.min.x;
  }

  get height() {
    return this.max.y - this.min.y;
  }

  get position() {
    return this.min.add(this.max).multiply(0.5);
  }
}