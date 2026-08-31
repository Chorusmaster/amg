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

  set position(pos: Vector2) {
    this.pos = pos;
  }

  get zoom() {
    return this.zoomLevel;
  }

  set zoom(zoom: number) {
    this.zoomLevel = zoom;
  }

  get viewport() {
    return this.viewportSize;
  }

  set viewport(viewportSize: Vector2) {
    if (viewportSize.x < 10 || viewportSize.y < 10) throw new Error("Camera is too small");
    this.viewportSize = viewportSize;
  }

  worldToScreen(coords: Vector2) {
    return new Vector2(
      (coords.x - this.pos.x) * this.zoomLevel + this.viewportSize.x * 0.5,
      (this.pos.y - coords.y) * this.zoomLevel + this.viewportSize.y * 0.5
    );
  }

  screenToWorld(coords: Vector2) {
    return new Vector2(
      (coords.x - this.viewportSize.x * 0.5) / this.zoomLevel + this.pos.x,
      this.pos.y - (coords.y - this.viewportSize.y * 0.5) / this.zoomLevel
    );
  }

  move(vector: Vector2) {
    this.pos = this.pos.add(vector);
  }
}