import Vector2 from "./vector2";

export default class Camera {
  private pos = new Vector2();
  private zoomLevel = 1;
  private viewportSize: Vector2;

  constructor(viewportSize: Vector2) {
    this.viewportSize = viewportSize;
  }

  get position() {
    return this.pos;
  }

  get zoom() {
    return this.zoomLevel
  }

  set zoom(zoom: number) {
    this.zoomLevel = zoom;
  }

  setViewportSize(viewportSize: Vector2) {
    this.viewportSize = viewportSize;
  }

  worldToScreen(coords: Vector2) {
    return coords
      .subtract(this.pos)
      .multiply(this.zoomLevel)
      .add(this.viewportSize.multiply(0.5));
  }

  screenToWorld(coords: Vector2) {
    return coords
      .subtract(this.viewportSize.multiply(0.5))
      .multiply(1 / this.zoomLevel)
      .add(this.pos);
  }

  move(vector: Vector2) {
    this.pos = this.pos.add(vector);
  }
}