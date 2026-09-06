import type TerrainGenerator from "./terrain-generator";

export default class CaveGenerator {
  private readonly noise: (x: number, y: number) => number;
  private readonly terrainGenerator: TerrainGenerator;

  constructor(
    noise: (x: number, y: number) => number,
    terrainGenerator: TerrainGenerator,
  ) {
    this.noise = noise;
    this.terrainGenerator = terrainGenerator;
  }

  isCave(x: number, y: number): boolean {
    const surfaceHeight = this.terrainGenerator.getSurfaceHeight(x);

    if (y > surfaceHeight) {
      return false;
    }

    const large = this.noise(x * 0.001, y * 0.001);
    const medium = this.noise(x * 0.04, y * 0.04);
    const detail = this.noise(x * 0.12, y * 0.12);

    const value =
      large * 0.4 +
      medium * 0.5 +
      detail * 0.1;

    return value < -0.4;
  }
}