import Camera from "./camera";
import Vector2 from "./vector2";

export default class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, imageSmoothing: boolean) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context");
    }

    this.ctx = ctx;
    ctx.imageSmoothingEnabled = imageSmoothing;
  }

  public clear(color: string) {
    this.ctx.fillStyle = color;

    this.ctx.fillRect(
      0,
      0,
      this.ctx.canvas.width,
      this.ctx.canvas.height
    );
  }

  public drawImage(
    image: HTMLImageElement,
    position: Vector2,
    size: Vector2
  ) {
    this.ctx.drawImage(image, position.x, position.y, size.x, size.y);
  }

  drawWorldImage(
    image: HTMLImageElement,
    camera: Camera,
    position: Vector2,
    size: Vector2
  ) {
    const screenSize = size.multiply(camera.zoom);
    const screenPosition = camera.worldToScreen(position).subtract(screenSize.multiply(0.5));

    this.drawImage(
      image,
      screenPosition,
      screenSize
    );
  }
}