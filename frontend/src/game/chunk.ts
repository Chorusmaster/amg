import { CHUNK_SIZE } from "./data/settings";

export default class Chunk {
  private blocks: number[];

  constructor() {
    this.blocks = new Array(CHUNK_SIZE * CHUNK_SIZE).fill(0);
  }

  get(x: number, y: number): number {
    return this.blocks[y * CHUNK_SIZE + x];
  }

  set(x: number, y: number, value: number): void {
    this.blocks[y * CHUNK_SIZE + x] = value;
  }
}