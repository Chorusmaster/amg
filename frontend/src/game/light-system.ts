import type World from "./world";
import { CHUNK_SIZE, MAX_LIGHT } from "./data/settings";

type LightNode = {
  x: number;
  y: number;
  light: number;
};

const UNDERGROUND_LEVEL_DEPTH = -10;

export default class LightSystem {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  onChunkLoaded(chunkX: number, chunkY: number): void {
    const minX = chunkX * CHUNK_SIZE;
    const minY = chunkY * CHUNK_SIZE;
    const maxX = minX + CHUNK_SIZE - 1;
    const maxY = minY + CHUNK_SIZE - 1;
    const queue: LightNode[] = [];

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.world.setSkyLight(x, y, 0);
        if (this.isSunlightSource(x, y)) {
          this.world.setSkyLight(x, y, MAX_LIGHT);
          queue.push({ x, y, light: MAX_LIGHT });
        }
      }
    }

    for (let x = minX; x <= maxX; x++) {
      this.addLoadedLightSeed(queue, x, minY - 1);
      this.addLoadedLightSeed(queue, x, maxY + 1);
    }
    for (let y = minY; y <= maxY; y++) {
      this.addLoadedLightSeed(queue, minX - 1, y);
      this.addLoadedLightSeed(queue, maxX + 1, y);
    }

    this.propagateAcrossLoadedChunks(queue);
  }

  onBlockChanged(x: number, y: number): void {
    const previousLight = this.world.getSkyLight(x, y) ?? 0;
    this.world.setSkyLight(x, y, 0);

    const relightQueue: LightNode[] = [];
    const removalQueue: LightNode[] = [{ x, y, light: previousLight }];
    const visited = new Set<string>();

    for (let index = 0; index < removalQueue.length; index++) {
      const node = removalQueue[index];
      const nodeKey = `${node.x},${node.y}`;
      if (visited.has(nodeKey)) continue;
      visited.add(nodeKey);

      for (const [neighborX, neighborY] of this.getNeighbors(node.x, node.y)) {
        const neighborLight = this.world.getSkyLight(neighborX, neighborY);
        if (neighborLight === undefined || neighborLight === 0) continue;

        if (
          neighborLight < node.light ||
          (neighborLight === node.light &&
            !this.isSunlightSource(neighborX, neighborY))
        ) {
          this.world.setSkyLight(neighborX, neighborY, 0);
          removalQueue.push({
            x: neighborX,
            y: neighborY,
            light: neighborLight,
          });
        } else {
          relightQueue.push({
            x: neighborX,
            y: neighborY,
            light: neighborLight,
          });
        }
      }
    }

    if (this.isSunlightSource(x, y)) {
      this.world.setSkyLight(x, y, MAX_LIGHT);
      relightQueue.push({ x, y, light: MAX_LIGHT });
    }

    this.propagateAcrossLoadedChunks(relightQueue);
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
        const surfaceY = this.world.worldGenerator.getSurfaceY(x);

        for (let y = maxY; y >= minY; y--) {
          const foregroundBlockId = this.world.getBlock(x, y);
          const backgroundBlockId = this.world.getBlock(x, y, false);

          if (foregroundBlockId == undefined || backgroundBlockId == undefined)
            continue;
          const foregroundBlock =
            this.world.gameContext.blockRegistry.getByIdOrThrow(
              foregroundBlockId,
            );

          if (
            !foregroundBlock.solid &&
            backgroundBlockId == 0 &&
            y > surfaceY + UNDERGROUND_LEVEL_DEPTH
          ) {
            this.world.setSkyLight(x, y, MAX_LIGHT);
            queue.push({ x, y, light: MAX_LIGHT });
            continue;
          }
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
      for (const [x, y] of this.getNeighbors(node.x, node.y)) {
        const blockId = this.world.getBlock(x, y);
        if (blockId === undefined) continue;

        const light = Math.max(0, node.light - this.getBlockOpacity(blockId));
        if (light <= (this.world.getSkyLight(x, y) ?? 0)) continue;

        this.world.setSkyLight(x, y, light);
        queue.push({ x, y, light });
      }
    }
  }

  private addLoadedLightSeed(queue: LightNode[], x: number, y: number): void {
    const light = this.world.getSkyLight(x, y);
    if (light !== undefined && light > 0) {
      queue.push({ x, y, light });
    }
  }

  private getNeighbors(
    x: number,
    y: number,
  ): ReadonlyArray<readonly [number, number]> {
    return [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
  }

  private isSunlightSource(x: number, y: number): boolean {
    const foregroundBlockId = this.world.getBlock(x, y);
    const backgroundBlockId = this.world.getBlock(x, y, false);
    if (foregroundBlockId === undefined || backgroundBlockId === undefined) {
      return false;
    }

    const foregroundBlock =
      this.world.gameContext.blockRegistry.getByIdOrThrow(foregroundBlockId);
    const surfaceY = this.world.worldGenerator.getSurfaceY(x);
    return (
      !foregroundBlock.solid &&
      backgroundBlockId === 0 &&
      y > surfaceY + UNDERGROUND_LEVEL_DEPTH
    );
  }

  private getBlockOpacity(blockId: number): number {
    const block = this.world.gameContext.blockRegistry.getByIdOrThrow(blockId);
    return block.lightOpacity;
  }
}
