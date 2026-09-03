export default class Vector2 {
  public x;
  public y;

  constructor(
    x = 0,
    y = 0
  ) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  addScalar(scalar: number): Vector2 {
    return new Vector2(this.x + scalar, this.y + scalar);
  }

  multiply(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  dot(v: Vector2) {
    return this.x * v.x + this.y * v.y
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize(): Vector2 {
    const length = this.length();

    if (length === 0) {
      return new Vector2();
    }

    return new Vector2(this.x / length, this.y / length);
  }

  distanceTo(v: Vector2): number {
    return this.subtract(v).length();
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }
}