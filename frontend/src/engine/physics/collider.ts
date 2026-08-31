import Vector2 from "../vector2";
import type Transform from "../transform";
import AABB from "./AABB";

export default class Collider {
  size: Vector2;
  offset: Vector2;

  constructor(
    size: Vector2,
    offset = new Vector2()
  ) {
    this.size = size;
    this.offset = offset;
  }

  getBounds(transform: Transform) {
    const center = transform.position.add(this.offset);

    const halfSize = this.size.multiply(0.5);

    return new AABB(
      center.subtract(halfSize),
      center.add(halfSize),
    );
  }
}