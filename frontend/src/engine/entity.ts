import type World from "../game/world";
import PhysicsBody from "./physics/physics-body";
import Transform from "./transform";

export default class Entity {
  readonly transform: Transform;
  readonly name: string;
  readonly image: HTMLImageElement;
  readonly physicsBody?: PhysicsBody;

  protected world!: World;

  constructor(
    name: string,
    image: HTMLImageElement,
    transform: Transform,
    physicsBody?: PhysicsBody,
  ) {
    this.name = name;
    this.image = image;
    this.transform = transform;
    this.physicsBody = physicsBody;
  }

  setWorld(world: World) {
    this.world = world;
  }

  onAddedToWorld() {}
  
  onTriggerEnter(_other: Entity) {}
}
