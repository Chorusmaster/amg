import Transform from "./transform";
import Vector2 from "./vector2";

export default class Entity {
  readonly transform = new Transform();
  readonly name;
  readonly image;

  constructor(name: string, image: HTMLImageElement, position: Vector2) {
    this.name = name;
    this.image = image;
    this.transform.position = position;
  }
}
