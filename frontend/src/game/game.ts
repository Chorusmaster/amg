import type Renderer from "../engine/renderer";
import type AssetManager from "../engine/asset-manager";
import type { Game } from "../engine/engine";
import Camera from "../engine/camera";
import Vector2 from "../engine/vector2";

export default class SandboxGame implements Game {
  private initialized = false;
  private camera!: Camera;

  private dirt!: HTMLImageElement;

  async initialize(assetManager: AssetManager, viewportSize: Vector2) {
    this.camera = new Camera(viewportSize);

    await assetManager.loadImage("dirt", "/assets/dirt.png");
    this.dirt = assetManager.getImage("dirt");
    
    this.initialized = true;
  }

  resize(viewportSize: Vector2) {
    if (!this.initialized) return;

    this.camera.setViewportSize(viewportSize);
  }
  
  update(dt: number) {
    if (this.initialized === false) throw new Error("Game must be initialized first to update");
  }

  render(renderer: Renderer) {
    if (this.initialized === false) throw new Error("Game must be initialized first to render");

    renderer.clear("skyblue");

    renderer.drawWorldImage(
      this.dirt, 
      this.camera, 
      new Vector2(0, 0), 
      new Vector2(32, 32)
    );
  }
}