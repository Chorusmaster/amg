import type Renderer from "../engine/renderer";
import type AssetManager from "../engine/asset-manager";
import type { Game } from "../engine/engine";

export default class SandboxGame implements Game {
  private dirt!: HTMLImageElement;

  async initialize(assets: AssetManager) {
    await assets.loadImage("dirt", "/assets/dirt.png");

    this.dirt = assets.getImage("dirt");
  }
  
  update(dt: number) {
  }

  render(renderer: Renderer) {
    renderer.clear("skyblue");

    renderer.drawImage(this.dirt, 100, 100, 32, 32);
  }
}