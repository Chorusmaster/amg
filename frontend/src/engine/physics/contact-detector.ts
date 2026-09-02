import Transform from "../transform";
import Vector2 from "../vector2";
import Collider from "./collider";
import type Collision from "./collision";
import type PhysicsBody from "./physics-body";

export default class ContactDetector {
  detectCollision(
    colliderA: Collider,
    colliderB: Collider,
    transformA: Transform,
    transformB: Transform,
    bodyA?: PhysicsBody,
    bodyB?: PhysicsBody,
  ): Collision | undefined {
    const boundsA = colliderA.getBounds(transformA);
    const boundsB = colliderB.getBounds(transformB);

    const overlapX =
      Math.min(boundsA.max.x, boundsB.max.x) -
      Math.max(boundsA.min.x, boundsB.min.x);

    const overlapY =
      Math.min(boundsA.max.y, boundsB.max.y) -
      Math.max(boundsA.min.y, boundsB.min.y);

    if (overlapX <= 0 || overlapY <= 0) {
      return undefined;
    }

    const centerA = boundsA.min.add(boundsA.max).multiply(0.5);

    const centerB = boundsB.min.add(boundsB.max).multiply(0.5);

    const direction = centerB.subtract(centerA);

    let normal: Vector2;
    let penetration: number;

    if (overlapX < overlapY) {
      normal = new Vector2(direction.x === 0 ? 1 : Math.sign(direction.x), 0);

      penetration = overlapX;
    } else {
      normal = new Vector2(0, direction.y === 0 ? 1 : Math.sign(direction.y));

      penetration = overlapY;
    }

    return {
      colliderA,
      bodyA,
      colliderB,
      bodyB,
      normal,
      penetration,
    };
  }

  detectTrigger(
    colliderA: Collider,
    colliderB: Collider,
    transformA: Transform,
    transformB: Transform,
  ): boolean {
    const boundsA = colliderA.getBounds(transformA);
    const boundsB = colliderB.getBounds(transformB);

    const overlapX =
      Math.min(boundsA.max.x, boundsB.max.x) -
      Math.max(boundsA.min.x, boundsB.min.x);

    const overlapY =
      Math.min(boundsA.max.y, boundsB.max.y) -
      Math.max(boundsA.min.y, boundsB.min.y);

    if (overlapX <= 0 || overlapY <= 0) {
      return false;
    }

    return true;
  }
}
