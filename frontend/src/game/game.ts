import type Renderer from "../engine/renderer";
import type AssetManager from "../engine/asset-manager";
import type { Game } from "../engine/engine";
import Camera from "../engine/camera";
import Vector2 from "../engine/vector2";
import Input from "../engine/input";
import World from "./world";
import BlockRegistry from "./block-registry";

export default class SandboxGame implements Game {
  private initialized = false;
  private camera!: Camera;
  private input!: Input;
  private blockRegistry!: BlockRegistry;

  private world!: World;

  private playerImage!: HTMLImageElement;
  private dirt!: HTMLImageElement;

  readonly settings = {
    imageSmoothing: false
  }

  async initialize(
    assetManager: AssetManager,
    input: Input,
    viewportSize: Vector2,
  ) {
    this.camera = new Camera(viewportSize);
    this.input = input;

    await assetManager.loadImage("player", "/assets/horus_2_0.png");
    this.playerImage = assetManager.getImage("player");

    await assetManager.loadImage("dirt", "/assets/dirt.png");
    this.dirt = assetManager.getImage("dirt");

    this.blockRegistry = await BlockRegistry.create(assetManager);
    this.world = new World(this.blockRegistry.blocksRegistry);
    this.world.generate();

    this.initialized = true;
  }

  resize(viewportSize: Vector2) {
    if (!this.initialized) return;

    this.camera.setViewportSize(viewportSize);
  }

  update(dt: number) {
    if (this.initialized === false)
      throw new Error("Game must be initialized first to update");

    if (this.input.isKeyDown("KeyA")) this.camera.move(new Vector2(-1, 0));
    if (this.input.isKeyDown("KeyD")) this.camera.move(new Vector2(1, 0));
  }

  render(renderer: Renderer) {
    if (this.initialized === false)
      throw new Error("Game must be initialized first to render");

    renderer.clear("skyblue");

    renderer.drawWorldImage(
      this.dirt,
      this.camera,
      new Vector2(0, 0),
      new Vector2(32, 32),
    );

    this.world.render(renderer, this.camera);
  }
}
