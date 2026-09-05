import { CHUNK_SIZE } from "./data/settings";

export default class Chunk {
  private background: Uint16Array;
  private foreground: Uint16Array;
  private skyLight: Uint8Array
  private blockLight: Uint8Array

  constructor() {
    const size = CHUNK_SIZE * CHUNK_SIZE;

    this.background = new Uint16Array(size);
    this.foreground = new Uint16Array(size);
    this.skyLight = new Uint8Array(size);
    this.blockLight = new Uint8Array(size);
  }

  getBackground(x: number, y: number): number {
    return this.background[y * CHUNK_SIZE + x];
  }

  setBackground(x: number, y: number, value: number): void {
    this.background[y * CHUNK_SIZE + x] = value;
  }

  getForeground(x: number, y: number): number {
    return this.foreground[y * CHUNK_SIZE + x];
  }

  setForeground(x: number, y: number, value: number): void {
    this.foreground[y * CHUNK_SIZE + x] = value;
  }

  getTotalLight(x: number, y: number): number {
    return this.getSkyLight(x, y);
  }

  getSkyLight(x: number, y: number): number {
    return this.skyLight[y * CHUNK_SIZE + x];
  }

  setSkyLight(x: number, y: number, value: number): void {
    this.skyLight[y * CHUNK_SIZE + x] = value;
  }

  getBlockLight(x: number, y: number): number {
    return this.blockLight[y * CHUNK_SIZE + x];
  }

  setBlockLight(x: number, y: number, value: number): void {
    this.blockLight[y * CHUNK_SIZE + x] = value;
  }
}