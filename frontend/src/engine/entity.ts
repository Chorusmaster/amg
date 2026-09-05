import type World from "../game/world";
import PhysicsBody from "./physics/physics-body";
import type Sprite from "./sprite";
import Transform from "./transform";
import type Renderer from "./renderer";
import { SHOW_HITBOXES } from "../game/data/settings";
import type GameContext from "../game/game-context";
import Vector2 from "./vector2";
import type Camera from "./camera";

export default class Entity {
  readonly transform: Transform;
  readonly name: string;
  readonly sprite?: Sprite;
  readonly physicsBody?: PhysicsBody;

  protected world!: World;
  protected gameContext!: GameContext;

  constructor(
    name: string,
    sprite: Sprite,
    transform: Transform,
    physicsBody?: PhysicsBody,
  ) {
    this.name = name;
    this.sprite = sprite;
    this.transform = transform;
    this.physicsBody = physicsBody;
  }

  setWorld(world: World) {
    this.world = world;
    this.gameContext = world.gameContext;
  }

  onAddedToWorld() {}
  
  onTriggerEnter(_other: Entity) {}

  render(renderer: Renderer, camera: Camera) {
    if (!this.world) throw new Error("Entity should be added to world first to be rendered");

    renderer.drawWorldImage(
      this.sprite!.image,
      camera,
      this.transform.position,
      this.transform.scale,
    );

    if (SHOW_HITBOXES && this.physicsBody) {
      for (const collider of this.physicsBody.colliders) {
        const colliderSize = collider.getBounds(this.physicsBody.transform);
        renderer.drawWorldImage(
          this.gameContext.assetManager.getImage("hitbox"),
          camera,
          colliderSize.position,
          new Vector2(colliderSize.width, colliderSize.height),
        );
      }
    }
  }
}
