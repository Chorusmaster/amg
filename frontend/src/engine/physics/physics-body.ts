import Vector2 from "../vector2";
import type Transform from "../transform";
import type Collider from "./collider";

export default class PhysicsBody {
  velocity = new Vector2();

  readonly transform: Transform;
  readonly colliders: Collider[] = [];
  readonly affectedByGravity: boolean;
  readonly isDynamic: boolean;
  readonly mass: number;
  previousPosition: Vector2;

  constructor(
    transform: Transform,
    colliders: Collider[],
    isDynamic = true,
    affectedByGravity = true,
    mass = 100,
  ) {
    this.transform = transform;
    this.previousPosition = transform.position;
    this.affectedByGravity = affectedByGravity;
    this.colliders = colliders;
    this.isDynamic = isDynamic;

    if (mass <= 0) {
      throw new Error("PhysicsBody mass must be greater than 0");
    }

    this.mass = mass;
  }

  get isMoving() {
    return this.velocity.x !== 0 ||
           this.velocity.y !== 0;
  }
}
