import type Camera from "../engine/camera";
import Entity from "../engine/entity";
import type Renderer from "../engine/renderer";
import Vector2 from "../engine/vector2";
import Block from "./block";

export default class World {
  private entities: Entity[] = [];
  private blocks = new Map<string, number>();
  private blocksRegistryList: Block[];
  readonly blockSize = 32;

  constructor(blocksRegistryList: Block[]) {
    this.blocksRegistryList = blocksRegistryList;
  }

  get entitiesList() {
    return this.entities;
  }

  add(entity: Entity) {
    this.entities.push(entity);
  }

  remove(entity: Entity) {
    const index = this.entities.indexOf(entity);

    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  worldToBlockCoords(coords: Vector2) {
    return coords.multiply(1 / this.blockSize);
  }

  blockToWorldCoords(coords: Vector2) {
    return coords.multiply(this.blockSize);
  }

  numbersToKey(n1: number, n2: number) {
    return `${n1},${n2}`;
  }

  getBlock(x: number, y: number) {
    return this.blocks.get(this.numbersToKey(x, y));
  }

  setBlock(x: number, y: number, block: number) {
    this.blocks.set(this.numbersToKey(x, y), block);
  }

  async generate() {
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (y == 0) this.blocks.set(this.numbersToKey(x, y), 2);
        else this.blocks.set(this.numbersToKey(x, y), 1);
      }
    }
  }

  render(renderer: Renderer, camera: Camera) {
    for (const [key, id] of this.blocks) {
      if (id >= this.blocksRegistryList.length) continue;

      const texture = this.blocksRegistryList[id].texture;
      if (!texture) continue;

      const [x, y] = key.split(",");
      const position = this.blockToWorldCoords(
        new Vector2(Number.parseInt(x), Number.parseInt(y)),
      );

      renderer.drawWorldImage(
        texture,
        camera,
        position,
        new Vector2(this.blockSize, this.blockSize),
      );
    }

    for (const entity of this.entities) {
      renderer.drawWorldImage(
        entity.image,
        camera,
        entity.transform.position,
        entity.transform.scale,
      );
    }
  }
}
