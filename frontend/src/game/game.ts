import type Renderer from "../engine/renderer";
import type AssetManager from "../engine/asset-manager";
import type { Game } from "../engine/engine";
import Camera from "../engine/camera";
import Vector2 from "../engine/vector2";
import Input from "../engine/input";

export default class SandboxGame implements Game {
  private initialized = false;
  private camera!: Camera;
  private input!: Input;

  private dirt!: HTMLImageElement;

  async initialize(
    assetManager: AssetManager,
    input: Input,
    viewportSize: Vector2,
  ) {
    this.camera = new Camera(viewportSize);
    this.input = input;

    await assetManager.loadImage("dirt", "/assets/dirt.png");
    this.dirt = assetManager.getImage("dirt");

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
  }
}
