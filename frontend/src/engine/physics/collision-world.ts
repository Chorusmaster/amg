import type AABB from "./AABB";

export default interface CollisionWorld {
  gravityAcceleration: number;
  getCollisions(bounds: AABB): AABB[];
}