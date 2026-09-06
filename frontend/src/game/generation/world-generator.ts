import alea from "alea";
import { createNoise2D } from "simplex-noise";

import Chunk from "../chunk";
import type World from "../world";
import type BlockRegistry from "../registries/block-registry";

import BiomeGenerator from "./biome-generator";
import TerrainGenerator from "./terrain-generator";
import CaveGenerator from "./cave-generator";
import OreGenerator from "./ore-generator";
import StructureGenerator from "./structure-generator";
import { CHUNK_SIZE } from "../data/settings";

const AIR = 0;

export default class WorldGenerator {
  private readonly biomeGenerator: BiomeGenerator;
  private readonly terrainGenerator: TerrainGenerator;
  private readonly caveGenerator: CaveGenerator;
  private readonly oreGenerator: OreGenerator;
  private readonly structureGenerator: StructureGenerator;

  private readonly blockRegistry: BlockRegistry;

  constructor(
    seed: string,
    world: World
  ) {
    const random = alea(seed);
    const noise = createNoise2D(random);

    const biomeRegistry = world.gameContext.biomeRegistry;

    const biomeGenerator = new BiomeGenerator(noise, biomeRegistry);
    const terrainGenerator = new TerrainGenerator(noise);
    const caveGenerator = new CaveGenerator(noise, terrainGenerator);
    const oreGenerator = new OreGenerator(noise);
    const structureGenerator = new StructureGenerator(noise, terrainGenerator);

    this.biomeGenerator = biomeGenerator;
    this.terrainGenerator = terrainGenerator;
    this.caveGenerator = caveGenerator;
    this.oreGenerator = oreGenerator;
    this.structureGenerator = structureGenerator;

    this.blockRegistry = world.gameContext.blockRegistry;
  }

  generateChunk(chunkX: number, chunkY: number): Chunk {
    const chunk = new Chunk();
    this.structureGenerator.prepareStructures(chunkX, chunkY, (x, y) => this.biomeGenerator.getBiome(x, y))

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      const worldX = chunkX * CHUNK_SIZE + localX;
      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        const worldY = chunkY * CHUNK_SIZE + localY;
        const biome = this.biomeGenerator.getBiome(worldX, worldY);

        const structureBlock = this.structureGenerator.getStructureBlock(worldX, worldY, biome);
        if (structureBlock) {
          chunk.setForeground(localX, localY, this.blockRegistry.getByNameOrThrow(structureBlock).id);
          continue;
        }

        const isCave = this.caveGenerator.isCave(worldX, worldY);
        const terrainBlock = this.terrainGenerator.getTerrainBlock(worldX, worldY, biome);
        if (isCave) {
          chunk.setForeground(localX, localY, AIR);
          if (terrainBlock) {
            chunk.setBackground(localX, localY, this.blockRegistry.getByNameOrThrow(terrainBlock).id);
          }
          continue;
        }

        if (terrainBlock === "stone") {
          const oreBlock = this.oreGenerator.getOre(worldX, worldY);

          if (oreBlock) {
            chunk.setForeground(localX, localY, this.blockRegistry.getByNameOrThrow(oreBlock).id);
            chunk.setBackground(localX, localY, this.blockRegistry.getByNameOrThrow("stone").id);

            continue;
          }
        }

        if (terrainBlock) {
          const blockId = this.blockRegistry.getByNameOrThrow(terrainBlock).id;

          chunk.setForeground(localX, localY, blockId);
          chunk.setBackground(localX, localY, blockId);

          continue;
        }

        chunk.setForeground(localX, localY, AIR);
        chunk.setBackground(localX, localY, AIR);
      }
    }

    return chunk;
  }
}