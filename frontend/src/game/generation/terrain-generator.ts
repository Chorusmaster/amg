import type { Biome } from "../registries/biome-registry";

export default class TerrainGenerator {
  private readonly noise: (x: number, y: number) => number;

  constructor(noise: (x: number, y: number) => number) {
    this.noise = noise;
  }

  getSurfaceHeight(x: number): number {
    return Math.floor(this.noise(x * 0.01, 0) * 10);
  }

  getStoneLevel(x: number): number {
    return Math.floor(6 + this.noise(x * 0.05, 4) * 3);
  }

  getTerrainBlock(x: number, y: number, biome: Biome): string | null {
    const surfaceHeight = this.getSurfaceHeight(x);

    if (y > surfaceHeight) {
      return null;
    }

    const stoneLevel = this.getStoneLevel(x);

    if (y === surfaceHeight) {
      return biome.surface;
    }

    if (y >= surfaceHeight - stoneLevel) {
      return biome.subsurface;
    }

    return biome.underground;
  }
}