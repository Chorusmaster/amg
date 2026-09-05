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
import GameContext from "./game-context";
import ItemRegistry from "./item-registry";

export default class SandboxGame implements Game {
  private initialized = false;
  private camera!: Camera;
  private physics!: Physics;
  private context!: GameContext;

  private player!: Player;
  private world!: World;

  readonly settings = {
    imageSmoothing: false
  }

  async initialize(
    assetManager: AssetManager,
    input: Input,
    viewportSize: Vector2,
  ) {
    assetManager.loadImage("player", "/assets/horus_2_0.png");
    assetManager.loadImage("hitbox", "/assets/hitbox.png");
    assetManager.loadImage("selection", "/assets/selection.png");
    assetManager.loadImage("inventory_slot", "/assets/inventory_slot.png");
    assetManager.loadImage("inventory_slot_selected", "/assets/inventory_slot_selected.png");

    this.camera = new Camera(viewportSize);
    
    const blockRegistry = await BlockRegistry.create(assetManager);
    const itemRegistry = await ItemRegistry.create(assetManager, blockRegistry);
    
    this.context = new GameContext(
      input,
      assetManager,
      blockRegistry,
      itemRegistry,
      this.camera.viewport
    );

    this.world = new World(this.context);

    this.player = new Player(this.context, new Vector2(0, 100), this.camera, this.world);
    this.world.add(this.player);

    this.physics = new Physics(this.world);

    this.initialized = true;
  }

  get gameContext() {
    return this.context;
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
    this.player.render(renderer, this.camera);
  }
}
