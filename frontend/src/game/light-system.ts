import type World from "./world";
import { CHUNK_SIZE, MAX_LIGHT } from "./data/settings";

type LightNode = {
  x: number;
  y: number;
  light: number;
};

export default class LightSystem {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  onChunkLoaded(): void {
    this.recalculateSunlight();
  }

  onBlockChanged(): void {
    this.recalculateSunlight();
  }

  recalculateSunlight(): void {
    const loadedChunks = this.world.getLoadedChunkCoordinates();
    if (loadedChunks.length === 0) return;

    this.clearLoadedLight(loadedChunks);

    const queue: LightNode[] = [];
    const minY =
      Math.min(...loadedChunks.map(([, chunkY]) => chunkY)) * CHUNK_SIZE;
    const maxY =
      (Math.max(...loadedChunks.map(([, chunkY]) => chunkY)) + 1) * CHUNK_SIZE -
      1;

    const loadedChunkXs = new Set(loadedChunks.map(([chunkX]) => chunkX));

    for (const chunkX of loadedChunkXs) {
      const minX = chunkX * CHUNK_SIZE;
      const maxX = minX + CHUNK_SIZE - 1;

      for (let x = minX; x <= maxX; x++) {
        let incomingLight = MAX_LIGHT;
        const surfaceY = this.world.surfaceY.get(x);

        for (let y = maxY; y >= minY; y--) {
          const blockId = this.world.getBlock(x, y);

          if (blockId === undefined) {
            if (!surfaceY || y < surfaceY) {
              incomingLight = 0;
            } else {
              incomingLight = MAX_LIGHT;
            }
            continue;
          }

          if (incomingLight > 0) {
            this.world.setSkyLight(x, y, incomingLight);
            queue.push({ x, y, light: incomingLight });
          }

          incomingLight = Math.max(
            0,
            incomingLight - this.getBlockOpacity(blockId, true),
          );
        }
      }
    }

    this.propagateAcrossLoadedChunks(queue);
  }

  private clearLoadedLight(loadedChunks: Array<[number, number]>): void {
    for (const [chunkX, chunkY] of loadedChunks) {
      for (let localY = 0; localY < CHUNK_SIZE; localY++) {
        for (let localX = 0; localX < CHUNK_SIZE; localX++) {
          this.world.setSkyLight(
            chunkX * CHUNK_SIZE + localX,
            chunkY * CHUNK_SIZE + localY,
            0,
          );
        }
      }
    }
  }

  private propagateAcrossLoadedChunks(queue: LightNode[]): void {
    for (let index = 0; index < queue.length; index++) {
      const node = queue[index];
      const neighbors = [
        [node.x + 1, node.y],
        [node.x - 1, node.y],
        [node.x, node.y + 1],
        [node.x, node.y - 1],
      ] as const;

      for (const [x, y] of neighbors) {
        const blockId = this.world.getBlock(x, y);
        if (blockId === undefined) continue;

        const light = Math.max(0, node.light - this.getBlockOpacity(blockId));
        if (light <= (this.world.getSkyLight(x, y) ?? 0)) continue;

        this.world.setSkyLight(x, y, light);
        queue.push({ x, y, light });
      }
    }
  }

  private getBlockOpacity(blockId: number, directSunlight = false): number {
    const block = this.world.gameContext.blockRegistry.getByIdOrThrow(blockId);
    return directSunlight && !block.solid ? 0 : block.lightOpacity;
  }
}
