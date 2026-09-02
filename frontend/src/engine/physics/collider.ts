import Vector2 from "../vector2";
import type Transform from "../transform";
import AABB from "./AABB";

type ColliderShape = "box" | "circle";
type InteractionMode = "none" | "collide" | "trigger";

export default class Collider {
  readonly size: Vector2;
  readonly offset: Vector2;
  readonly shape: ColliderShape;
  readonly staticMode: InteractionMode;
  readonly dynamicMode: InteractionMode;

  constructor(
    size: Vector2, 
    offset = new Vector2(), 
    staticMode: InteractionMode = "collide",
    dynamicMode: InteractionMode = "collide",
    shape: ColliderShape = "box"
  ) {
    this.size = size;
    this.offset = offset;
    this.staticMode = staticMode;
    this.dynamicMode = dynamicMode;
    this.shape = shape;
  }

  getBounds(transform: Transform) {
    const center = transform.position.add(this.offset);

    const halfSize = this.size.multiply(0.5);

    return new AABB(center.subtract(halfSize), center.add(halfSize));
  }
}
