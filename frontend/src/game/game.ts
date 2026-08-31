import type Renderer from "../engine/renderer";
import type AssetManager from "../engine/asset-manager";
import type { Game } from "../engine/engine";
import Camera from "../engine/camera";
import Vector2 from "../engine/vector2";
import Input from "../engine/input";
import World from "./world";
import BlockRegistry from "./block-registry";
import Physics from "../engine/physics/physics";
import Player from "./player";

export default class SandboxGame implements Game {
  private initialized = false;
  private camera!: Camera;
  private physics!: Physics;
  private blockRegistry!: BlockRegistry;
  private assetManager!: AssetManager;

  private player!: Player;
  private world!: World;

  private playerImage!: HTMLImageElement;

  readonly settings = {
    imageSmoothing: false
  }

  async initialize(
    assetManager: AssetManager,
    input: Input,
    viewportSize: Vector2,
  ) {
    this.camera = new Camera(viewportSize);
    this.assetManager = assetManager;

    assetManager.loadImage("player", "/assets/horus_2_0.png");
    assetManager.loadImage("hitbox", "/assets/hitbox.png");
    assetManager.loadImage("selection", "/assets/selection.png");

    this.blockRegistry = await BlockRegistry.create(assetManager);
    this.world = new World(this.blockRegistry.blocksRegistry);

    this.physics = new Physics(this.world);

    this.player = new Player(assetManager, new Vector2(0, 100), this.camera, input, this.world);
    this.physics.add(this.player.physicsBody);

    this.initialized = true;
  }

  resize(viewportSize: Vector2) {
    if (!this.initialized) return;

    this.camera.viewport = viewportSize;
  }

  update(dt: number) {
    if (this.initialized === false) 
      throw new Error("Game must be initialized first to update");

    this.player.update(dt);
    this.physics.update(dt);

    this.camera.position = this.player.transform.position.clone();
  }

  render(renderer: Renderer) {
    if (this.initialized === false)
      throw new Error("Game must be initialized first to render");

    renderer.clear("skyblue");

    this.world.render(renderer, this.camera);
    this.player.render(renderer);
  }
}
