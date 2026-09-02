import type Collider from "./collider";
import type Transform from "../transform";

export default interface WorldCollider {
  collider: Collider;
  transform: Transform;
}
