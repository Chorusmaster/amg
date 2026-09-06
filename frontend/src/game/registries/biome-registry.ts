import biomesData from "../data/biomes.json";
import type BlockRegistry from "./block-registry";

export type Biome = (typeof biomesData)[number];

export default class BiomeRegistry {
  private readonly biomesByName = new Map<string, Biome>();
  private readonly biomesById = new Map<number, Biome>();

  private constructor(biomes: Biome[]) {
    for (const biome of biomes) {
      this.biomesById.set(biome.id, biome);
      this.biomesByName.set(biome.name, biome);
    }
  }

  getById(id: number): Biome | undefined {
    return this.biomesById.get(id);
  }

  getByIdOrThrow(id: number): Biome {
    const biome = this.biomesById.get(id);

    if (!biome) {
      throw new Error(`Biome with id ${id} not found`);
    }

    return biome;
  }

  getByName(name: string): Biome | undefined {
    return this.biomesByName.get(name);
  }

  getByNameOrThrow(name: string): Biome {
    const biome = this.biomesByName.get(name);

    if (!biome) {
      throw new Error(`Biome with name ${name} not found`);
    }

    return biome;
  }

  static create(blockRegistry: BlockRegistry): BiomeRegistry {
    for (const biome of biomesData) {
      const blocks = [
        biome.surface,
        biome.subsurface,
        biome.underground,
      ];

      for (const blockName of blocks) {
        if (!blockRegistry.getByName(blockName)) {
          throw new Error(
            `Block ${blockName} referenced by biome ${biome.name} doesn't exist`,
          );
        }
      }
    }

    return new BiomeRegistry(biomesData);
  }
}
