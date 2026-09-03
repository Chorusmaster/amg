import Entity from "../engine/entity";
import PhysicsBody from "../engine/physics/physics-body";
import Transform from "../engine/transform";
import Vector2 from "../engine/vector2";
import Collider from "../engine/physics/collider";
import { ITEM_SIZE, ITEM_DESPAWN_TIME } from "./data/settings";

export type ItemEntry = {
  item: string,
  quantity: number
}

export default class ItemStack extends Entity {
  readonly items = new Map<string, number>();

  constructor(items: ItemEntry[], image: HTMLImageElement, position: Vector2) {
    const transform = new Transform(
      position,
      new Vector2(ITEM_SIZE, ITEM_SIZE),
    );

    super(
      "Item_stack",
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

    for (const item of items) {
      this.items.set(item.item, item.quantity);
    }
  }

  onAddedToWorld() {
    setTimeout(() => {
      this.world?.remove(this);
    }, ITEM_DESPAWN_TIME);
  }

  onTriggerEnter(other: Entity) {
    if (other instanceof ItemStack && this.world) {
      if (this.items.size === 0 ) return;

      for (const [key, quantity] of other.items) {
        this.items.set(
          key,
          (this.items.get(key) ?? 0) + quantity
        );
      }

      other.items.clear();
      this.world.remove(other);
    }
  }
}
