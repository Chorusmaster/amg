import type Entity from "../entity";
import type AABB from "./AABB";
import type WorldCollider from "./world-collider";
import type PhysicsBody from "./physics-body";

export default interface CollisionWorld {
  gravityAcceleration: number;
  entitiesList: Entity[];
  remove(entity: Entity): void;
  query(bounds: AABB): WorldCollider[];
}
