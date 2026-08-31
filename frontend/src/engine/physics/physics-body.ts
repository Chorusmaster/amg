import Vector2 from "../vector2";
import type Transform from "../transform";
import type Collider from "./collider";

export default class PhysicsBody {
  velocity = new Vector2();

  readonly transform: Transform;
  readonly collider: Collider | null;
  readonly affectedByGravity: boolean;

  constructor(
    transform: Transform,
    affectedByGravity = true,
    collider: Collider | null = null
  ) {
    this.transform = transform;
    this.affectedByGravity = affectedByGravity;
    this.collider = collider;
  }
}