export default class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context");
    }

    this.ctx = ctx;
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
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.ctx.drawImage(image, x, y, width, height);
  }
}