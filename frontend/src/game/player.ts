import type Camera from "../engine/camera";
import Entity from "../engine/entity";
import type Input from "../engine/input";
import Vector2 from "../engine/vector2";
import PhysicsBody from "../engine/physics/physics-body";
import Transform from "../engine/transform";
import Collider from "../engine/physics/collider";
import type Renderer from "../engine/renderer";
import type World from "./world";
import type AssetManager from "../engine/asset-manager";
import AABB from "../engine/physics/AABB";
import { SHOW_HITBOXES } from "./data/settings";

export default class Player extends Entity {
  readonly speed = 100;
  readonly jumpForce = 300;
  readonly interactionRange = 200;

  private physicsBodyComponent: PhysicsBody;
  private camera;
  private assetManager: AssetManager;
  private input: Input;
  private world: World;

  constructor(
    assetManager: AssetManager,
    spawnPos: Vector2,
    camera: Camera,
    input: Input,
    world: World
  ) {
    const playerImage = assetManager.getImage("player");

    super("Player", playerImage, new Transform(spawnPos, new Vector2(92, 92)));

    this.assetManager = assetManager;
    this.camera = camera;
    this.input = input;
    this.world = world
    this.physicsBodyComponent = new PhysicsBody(
      this.transform,
      true,
      new Collider(new Vector2(30, 92)),
    );
  }

  get physicsBody() {
    return this.physicsBodyComponent;
  }

  private isGrounded(): boolean {
    const bounds = this.physicsBody.collider!.getBounds(
      this.transform
    );

    const checkBounds = new AABB(
      new Vector2(
        bounds.min.x + 0.01,
        bounds.min.y - 1
      ),
      new Vector2(
        bounds.max.x - 0.01,
        bounds.min.y
      )
    );

    return this.world.getCollisions(checkBounds).length > 0;
  }

  private canPlaceBlock(coords: Vector2): boolean {
    const blockBounds = this.world.getBlockBounds(coords);

    const playerBounds = this.physicsBody.collider!.getBounds(
      this.transform
    );

    return !(
      playerBounds.max.x > blockBounds.min.x &&
      playerBounds.min.x < blockBounds.max.x &&
      playerBounds.max.y > blockBounds.min.y &&
      playerBounds.min.y < blockBounds.max.y
    );
  }

  update(dt: number) {
    let directionX = 0;

    if (this.input.isKeyDown("KeyA"))
      directionX -= 1;

    if (this.input.isKeyDown("KeyD"))
      directionX += 1;

    this.physicsBody.velocity.x = directionX * this.speed;

    if (this.input.isKeyDown("Space") && this.isGrounded()) {
      console.log("jumped");
      this.physicsBody.velocity.y = this.jumpForce;
    }

    if (this.input.isMouseButtonDown(0)) {
      const worldCoords = this.camera.screenToWorld(this.input.mousePosition);
      
      if (this.transform.position.distanceTo(worldCoords) > this.interactionRange) 
        return;

      const {x: blockX, y: blockY} = this.world.worldToBlockCoords(worldCoords);
      this.world.setBlock(blockX, blockY, 0);
    }

    if (this.input.isMouseButtonDown(2)) {
      const worldCoords = this.camera.screenToWorld(this.input.mousePosition);
      
      if (this.transform.position.distanceTo(worldCoords) > this.interactionRange) 
        return;

      const blockCoords = this.world.worldToBlockCoords(worldCoords);
      if (this.canPlaceBlock(worldCoords)) this.world.setBlock(blockCoords.x, blockCoords.y, 1);
    }
  }

  render(renderer: Renderer) {
    renderer.drawWorldImage(
      this.image,
      this.camera,
      this.transform.position,
      this.transform.scale,
    );

    if (SHOW_HITBOXES) {
      const collider = this.physicsBody.collider!;
      const colliderSize = collider.getBounds(this.physicsBody.transform);
      renderer.drawWorldImage(
        this.assetManager.getImage("hitbox"),
        this.camera,
        colliderSize.position,
        new Vector2(colliderSize.width, colliderSize.height),
      );
    }
  }
}
