import Entity from "../engine/entity";
import PhysicsBody from "../engine/physics/physics-body";
import Transform from "../engine/transform";
import Vector2 from "../engine/vector2";
import Collider from "../engine/physics/collider";
import { ITEM_SIZE, ITEM_DESPAWN_TIME } from "./data/settings";

export default class Item extends Entity {
  constructor(name: string, image: HTMLImageElement, position: Vector2) {
    const transform = new Transform(
      position,
      new Vector2(ITEM_SIZE, ITEM_SIZE),
    );

    super(
      name,
      image,
      transform,
      new PhysicsBody(
        transform,
        [new Collider(
          new Vector2(ITEM_SIZE * 2, ITEM_SIZE * 2),
          new Vector2(0, 0),
          "collide",
          "trigger"
        )],
        true,
        true
      ),
    );
  }

  onAddedToWorld() {
    setTimeout(() => {
      this.world?.remove(this);
    }, ITEM_DESPAWN_TIME);
  }

  onTriggerEnter(other: Entity) {
    if (other.name === "Player" && this.world) {
      this.world.remove(this);
    }
  }
}
