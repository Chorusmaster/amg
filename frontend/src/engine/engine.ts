import AssetManager from "./asset-manager";
import GameLoop from "./gameloop";
import Renderer from "./renderer";

import Vector2 from "./vector2";

export interface Game {
  initialize(assetManager: AssetManager, viewportSize: Vector2): Promise<void>;
  update: (dt: number) => void;
  render: (renderer: Renderer) => void;
  resize: (viewportSize: Vector2) => void;
}

export default class Engine {
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private assetManager: AssetManager;
  private game: Game;
  private canvas: HTMLCanvasElement;

  constructor(
    canvas: HTMLCanvasElement,
    game: Game
  ) {
    this.canvas = canvas;
    this.renderer = new Renderer(this.canvas);
    this.assetManager = new AssetManager();
    this.game = game;

    this.gameLoop = new GameLoop(
      (dt) => this.game.update(dt),
      () => this.game.render(this.renderer)
    );
  }

  resize(width: number, height: number) {
    this.game.resize(new Vector2(width, height));
  }

  async start() {
    await this.game.initialize(
      this.assetManager, 
      new Vector2(this.canvas.width, this.canvas.height)
    );

    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}