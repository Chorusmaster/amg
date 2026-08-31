import Transform from "./transform";

export default class Entity {
  readonly transform: Transform;
  readonly name: string;
  readonly image: HTMLImageElement;

  constructor(name: string, image: HTMLImageElement, transform: Transform) {
    this.name = name;
    this.image = image;
    this.transform = transform;
  }
}
