import type PhysicsBody from "./physics-body";
import type Collider from "./collider";
import type Vector2 from "../vector2";

export default interface Collision {
  bodyA?: PhysicsBody;
  colliderA: Collider;

  bodyB?: PhysicsBody;
  colliderB: Collider;

  normal: Vector2;
  penetration: number;
}