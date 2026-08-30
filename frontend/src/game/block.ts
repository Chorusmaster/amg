export default class Block {
  readonly id: number;
  readonly name: string;
  readonly texture: HTMLImageElement | null;

  constructor(
    id: number,
    name: string,
    texture: HTMLImageElement | null
  ) {
    this.id = id;
    this.name = name;
    this.texture = texture;
  }
}