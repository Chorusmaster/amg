import type CollisionWorld from "./collision-world";
import PhysicsBody from "./physics-body";
import Vector2 from "../vector2";
import AABB from "./AABB";

const EPSILON = 0.001;

export default class Physics {
  private world: CollisionWorld;
  private bodies = new Set<PhysicsBody>();

  constructor(world: CollisionWorld) {
    this.world = world;
  }

  add(body: PhysicsBody) { this.bodies.add(body); }

  remove(body: PhysicsBody) { this.bodies.delete(body); }

  update(dt: number) {
    for (const body of this.bodies) {
      this.updateBody(body, dt);
    }
  }

  updateBody(body: PhysicsBody, deltaTime: number) {
    if (body.affectedByGravity) {
      body.velocity.y -= this.world.gravityAcceleration * deltaTime;
    }

    if (!body.collider) {
      body.transform.position.x += body.velocity.x * deltaTime;
      body.transform.position.y += body.velocity.y * deltaTime;
      return;
    }

    if (Math.abs(body.velocity.x) > EPSILON) {
      this.moveHorizontal(body, deltaTime);
    }

    if (Math.abs(body.velocity.y) > EPSILON) {
      this.moveVertical(body, deltaTime);
    }
  }

  private moveVertical(body: PhysicsBody, deltaTime: number) {
    const collider = body.collider!;
    const movement = body.velocity.y * deltaTime;
    const bounds = collider.getBounds(body.transform);

    let queryBounds: AABB;

    if (movement > 0) {
      queryBounds = new AABB(
        new Vector2(bounds.min.x + EPSILON, bounds.max.y + EPSILON),
        new Vector2(bounds.max.x - EPSILON, bounds.max.y + movement - EPSILON)
      );
    } else {
      queryBounds = new AABB(
        new Vector2(bounds.min.x + EPSILON, bounds.min.y + movement + EPSILON),
        new Vector2(bounds.max.x - EPSILON, bounds.min.y - EPSILON)
      );
    }

    const collisions = this.world.getCollisions(queryBounds);

    if (collisions.length === 0) {
      body.transform.position.y += movement;
      return;
    }

    if (movement < 0) {
      const surface = Math.max(...collisions.map(c => c.max.y));
      body.transform.position.y = surface + (body.transform.position.y - bounds.min.y);
    } else {
      const surface = Math.min(...collisions.map(c => c.min.y));
      body.transform.position.y = surface - (bounds.max.y - body.transform.position.y);
    }

    body.velocity.y = 0;
  }

  private moveHorizontal(body: PhysicsBody, deltaTime: number) {
    const collider = body.collider!;
    const movement = body.velocity.x * deltaTime;
    const bounds = collider.getBounds(body.transform);

    let queryBounds: AABB;

    if (movement > 0) {
      queryBounds = new AABB(
        new Vector2(bounds.max.x + EPSILON, bounds.min.y + EPSILON),
        new Vector2(bounds.max.x + movement - EPSILON, bounds.max.y - EPSILON)
      );
    } else {
      queryBounds = new AABB(
        new Vector2(bounds.min.x + movement + EPSILON, bounds.min.y + EPSILON),
        new Vector2(bounds.min.x - EPSILON, bounds.max.y - EPSILON)
      );
    }

    const collisions = this.world.getCollisions(queryBounds);

    if (collisions.length === 0) {
      body.transform.position.x += movement;
      return;
    }

    if (movement > 0) {
      const surface = Math.min(...collisions.map(c => c.min.x));
      body.transform.position.x = surface - (bounds.max.x - body.transform.position.x);
    } else {
      const surface = Math.max(...collisions.map(c => c.max.x));
      body.transform.position.x = surface + (body.transform.position.x - bounds.min.x);
    }

    body.velocity.x = 0;
  }
}