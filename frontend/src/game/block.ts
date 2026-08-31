export default class Block {
  readonly id: number;
  readonly name: string;
  readonly solid: boolean;
  readonly texture: HTMLImageElement | null;

  constructor(
    id: number,
    name: string,
    solid: boolean,
    texture: HTMLImageElement | null
  ) {
    this.id = id;
    this.name = name;
    this.solid = solid;
    this.texture = texture;
  }
}