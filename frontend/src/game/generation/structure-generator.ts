import type { Biome } from "../registries/biome-registry";
import type TerrainGenerator from "./terrain-generator";
import { CHUNK_SIZE } from "../data/settings";

type StructureBlock = {
  x: number;
  y: number;
  block: string;
};

export default class StructureGenerator {
  private readonly noise: (x: number, y: number) => number;
  private readonly terrainGenerator: TerrainGenerator;

  private readonly generatedChunks = new Set<string>();
  private readonly generatedBlocks = new Map<string, string>();

  constructor(
    noise: (x: number, y: number) => number,
    terrainGenerator: TerrainGenerator,
  ) {
    this.noise = noise;
    this.terrainGenerator = terrainGenerator;
  }

  isTree(x: number, biome: Biome): boolean {
    if (!biome.trees) return false;

    return this.noise(x, 5) > 0.7;
  }

  isGrass(x: number, biome: Biome): boolean {
    if (!biome.grass) return false;

    return this.noise(x, 5) < -0.4;
  }

  prepareStructures(
    chunkX: number,
    chunkY: number,
    getBiome: (x: number, y: number) => Biome,
  ): void {
    const chunkKey = `${chunkX},${chunkY}`;

    if (this.generatedChunks.has(chunkKey)) {
      return;
    }

    this.generatedChunks.add(chunkKey);

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      const startX = chunkX * CHUNK_SIZE + localX;
      const startY = this.terrainGenerator.getSurfaceHeight(startX) + 1;
      
      const biome = getBiome(startX, startY);
      if (!this.isTree(startX, biome)) {
        continue;
      }

      const tree = this.generateOakTree();
      for (const block of tree) {
        this.generatedBlocks.set(
          `${startX + block.x},${startY + block.y}`,
          block.block,
        );
      }
    }
  }

  getStructureBlock(x: number, y: number, biome: Biome): string | undefined {
    const surfaceHeight = this.terrainGenerator.getSurfaceHeight(x);
    if (
      y == surfaceHeight + 1 && 
      this.isGrass(x, biome) && 
      !this.generatedBlocks.get(`${x},${y}`)
    ) {
      return "grass";
    }
    return this.generatedBlocks.get(`${x},${y}`);
  }

  generateOakTree(): StructureBlock[] {
    const blocks: StructureBlock[] = [];

    const height = 4 + Math.floor(Math.random() * 3);
    const crownRadius = 2 + Math.floor(Math.random() * 2);

    for (let y = 0; y < height; y++) {
      blocks.push({
        x: 0,
        y,
        block: "wood",
      });
    }

    const crownY = height;

    for (let y = -1; y <= 1; y++) {
      const radius = crownRadius - Math.abs(y);

      for (let x = -radius; x <= radius; x++) {
        if (
          Math.abs(x) === radius &&
          Math.random() < 0.5
        ) {
          continue;
        }

        blocks.push({
          x,
          y: crownY + y,
          block: "leaves",
        });
      }
    }

    return blocks;
  }
}