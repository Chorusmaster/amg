import AssetManager from "./asset-manager";
import GameLoop from "./gameloop";
import Renderer from "./renderer";
import Input from "./input";

import Vector2 from "./vector2";

export interface Game {
  initialize(assetManager: AssetManager, input: Input, viewportSize: Vector2): Promise<void>;
  update: (dt: number) => void;
  render: (renderer: Renderer) => void;
  resize: (viewportSize: Vector2) => void;
}

export default class Engine {
  private canvas: HTMLCanvasElement;
  private gameLoop: GameLoop;
  private renderer: Renderer;
  private assetManager: AssetManager;
  private input: Input;
  private game: Game;

  constructor(
    canvas: HTMLCanvasElement,
    game: Game
  ) {
    this.canvas = canvas;
    this.renderer = new Renderer(this.canvas);
    this.assetManager = new AssetManager();
    this.input = new Input(this.canvas);
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
      this.input, 
      new Vector2(this.canvas.width, this.canvas.height)
    );

    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }
}