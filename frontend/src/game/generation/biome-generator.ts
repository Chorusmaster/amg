import type BiomeRegistry from "../registries/biome-registry";

export default class BiomeGenerator {
  private readonly noise: (x: number, y: number) => number;
  private readonly biomeRegistry: BiomeRegistry;

  constructor(
    noise: (x: number, y: number) => number,
    biomeRegistry: BiomeRegistry,
  ) {
    this.noise = noise;
    this.biomeRegistry = biomeRegistry;
  }

  getBiome(x: number, y: number) {
    const value = this.noise(x * 0.002, y * 0.002);

    return this.biomeRegistry.getByNameOrThrow(
      value < -0.4 ? "desert" : "plains",
    );
  }
}