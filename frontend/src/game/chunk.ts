import { CHUNK_SIZE } from "./data/settings";

export default class Chunk {
  private background: Uint16Array;
  private foreground: Uint16Array;
  private light: Uint8Array;

  constructor() {
    const size = CHUNK_SIZE * CHUNK_SIZE;

    this.background = new Uint16Array(size);
    this.foreground = new Uint16Array(size);
    this.light = new Uint8Array(size);
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

  getLight(x: number, y: number): number {
    return this.light[y * CHUNK_SIZE + x];
  }

  setLight(x: number, y: number, value: number): void {
    this.light[y * CHUNK_SIZE + x] = value;
  }
}