import AssetManager from "./asset-manager";
import GameLoop from "./gameloop";
import Renderer from "./renderer";

export interface Game {
  initialize(assets: AssetManager): Promise<void>;
  update: (dt: number) => void;
  render: (renderer: Renderer) => void;
}

export default class Engine {
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private assetManager: AssetManager;
  private game: Game;

  constructor(
    canvas: HTMLCanvasElement,
    game: Game
  ) {
    this.renderer = new Renderer(canvas);
    this.assetManager = new AssetManager();
    this.game = game;

    this.gameLoop = new GameLoop(
      (dt) => this.game.update(dt),
      () => this.game.render(this.renderer)
    );
  }

  async start() {
    await this.game.initialize(this.assetManager);

    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}