import Chunk from "./chunk";
import { CHUNK_SIZE } from "./data/settings";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import type World from "./world";

type BIOME = "PLAINS" | "DESERT";

export default class WorldGenerator {
  private readonly noise;
  private readonly world: World;

  constructor(seed: string, world: World) {
    const random = alea(seed);
    this.noise = createNoise2D(random);
    this.world = world;
  }

  getBiomeType(x: number, y: number): BIOME {
    const value = this.noise(x * 0.002, y * 0.002);
    return value < -0.4 ? "DESERT" : "PLAINS";
  }

  getSurfaceHeight(x: number): number {
    const value = this.noise(x * 0.01, 0);
    return Math.floor(value * 10);
  }

  getStoneLevel(x: number): number {
    const value = this.noise(x * 0.05, 4);
    return Math.floor(6 + (value * 3));
  }

  isCave(x: number, y: number): boolean {
    const ultraLarge = this.noise(x * 0.001, y * 0.001);
    const large = this.noise(x * 0.04, y * 0.04);
    const detail = this.noise(x * 0.12, y * 0.12);

    const value = ultraLarge * 0.4 + large * 0.5 + detail * 0.1;

    return value < -0.4;
  }

  isCoal(x: number, y: number): boolean {
    const medium = this.noise(x * 0.06, y * 0.06);
    const small = this.noise(x * 0.12, y * 0.12);

    const value = medium * 0.4 + small * 0.6;

    return value < -0.68;
  }

  isCopper(x: number, y: number): boolean {
    const medium = this.noise(x * 0.06, y * 0.06);
    const small = this.noise(x * 0.12, y * 0.12);

    const value = medium * 0.4 + small * 0.6;

    return value > 0.75;
  }

  generateChunk(chunkX: number, chunkY: number): Chunk {
    const chunk = new Chunk();
    
    for (let x = 0; x < CHUNK_SIZE; x++) {
      const surfaceHight = this.getSurfaceHeight(chunkX * CHUNK_SIZE + x);
      const dirtLevel = this.getStoneLevel(chunkX * CHUNK_SIZE + x);

      for (let y = 0; y < CHUNK_SIZE; y++) {
        const blockX = chunkX * CHUNK_SIZE + x;
        const blockY = chunkY * CHUNK_SIZE + y;
        const biome = this.getBiomeType(chunkX * CHUNK_SIZE + x, chunkY * CHUNK_SIZE + y);

        let blockType = 0;
        if (!this.isCave(chunkX * CHUNK_SIZE + x, chunkY * CHUNK_SIZE + y)) {
          if (blockY == surfaceHight) {
            if (biome == 'PLAINS') blockType = 2;
            else blockType = 5;
          }
          else if (blockY < surfaceHight && blockY >= surfaceHight - dirtLevel) {
            if (biome == 'PLAINS') blockType = 1;
            else blockType = 5;
          }
          else if (blockY < surfaceHight - dirtLevel) {
            if (this.isCoal(chunkX * CHUNK_SIZE + x, chunkY * CHUNK_SIZE + y)) blockType = 4;
            else if (this.isCopper(chunkX * CHUNK_SIZE + x, chunkY * CHUNK_SIZE + y)) blockType = 6;
            else blockType = 3;
          }
        }
          
        chunk.setForeground(x, y, blockType);
      }
    }

    this.world.lightSystem.setupChunkSunlight(chunk, chunkX, chunkY);

    return chunk;
  }
}