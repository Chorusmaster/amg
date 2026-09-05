import Vector2 from "../engine/vector2";
import type World from "./world";
import { CHUNK_SIZE, MAX_LIGHT } from "./data/settings";

export default class LightSystem {
  private readonly world: World;

  constructor(world: World) {
    this.world = world;
  }

  setupChunkSunlight(
    chunkX: number,
    chunkY: number,
  ): LightNode[] {
    const startX = chunkX * CHUNK_SIZE;
    const startY = chunkY * CHUNK_SIZE;
    const queue: LightNode[] = [];

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      const worldX = startX + localX;

      const surfaceHeight =
        this.world.worldGenerator.getSurfaceHeight(worldX);

      for (let localY = CHUNK_SIZE - 1; localY >= 0; localY--) {
        const worldY = startY + localY;

        if (worldY <= surfaceHeight) {
          break;
        }

        const blockId = this.world.getBlock(worldX, worldY);

        if (blockId === undefined) {
          continue;
        }

        const block =
          this.world.gameContext.blockRegistry
            .getByIdOrThrow(blockId);

        if (block.solid) {
          break;
        }

        this.world.setLight(
          worldX,
          worldY,
          MAX_LIGHT,
        );

        if(worldY == surfaceHeight + 1) {
          queue.push({
            x: worldX,
            y: worldY,
            light: MAX_LIGHT,
          });
        }
      }
    }

    return queue;
  }

  spreadSunlight(
    x: number,
    y: number,
    light: number,
  ): void {
    const queue: LightNode[] = [
      { x, y, light },
    ];

    const processed = new Map<string, number>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      const key = `${current.x},${current.y}`;

      const processedLight = processed.get(key) ?? -1;

      if (processedLight >= current.light) {
        continue;
      }

      processed.set(key, current.light);

      this.world.setLight(
        current.x,
        current.y,
        current.light,
      );

      for (const direction of DIRECTIONS) {
        const newX = current.x + direction.x;
        const newY = current.y + direction.y;

        const blockId = this.world.getBlock(newX, newY);

        if (blockId === undefined) {
          continue;
        }

        const block =
          this.world.gameContext.blockRegistry
            .getByIdOrThrow(blockId);

        const isHorizontal = direction.y === 0;

        let attenuation: number;

        if (block.solid) {
          attenuation = 3;
        } else if (isHorizontal) {
          attenuation = 1;
        } else {
          attenuation = 0;
        }

        const newLight = current.light - attenuation;

        if (newLight <= 0) {
          continue;
        }

        const oldNeighborLight =
          this.world.getLight(newX, newY);

        if (oldNeighborLight >= newLight) {
          continue;
        }

        queue.push({
          x: newX,
          y: newY,
          light: newLight,
        });
      }
    }
  }

  onBlockChanged(
    x: number,
    y: number,
  ): void {
    const light = this.world.getLight(x, y);

    const queue = [
      { x, y },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      const maxLight = this.getMaxLightFromNeighbours(current.x, current.y);
      this.world.setLight(current.x, current.y, maxLight);

      for (const direction of DIRECTIONS) {
        const neighborX = current.x + direction.x;
        const neighborY = current.y + direction.y;

        const neighborId = this.world.getBlock(neighborX, neighborY);
        if(neighborId === undefined) continue;

        const OldNeighhbourLight = this.world.getLight(neighborX, neighborY);
        const NewNeighbourLight = this.getMaxLightFromNeighbours(neighborX, neighborY);

        if (OldNeighhbourLight !== NewNeighbourLight) {
          queue.push({
            x: neighborX,
            y: neighborY
          });
        }
      }
    }
  }

  private getMaxLightFromNeighbours(
    x: number,
    y: number
  ): number {
    let maxLight = 0;

    const blockId = this.world.getBlock(x, y);
    if(blockId === undefined) return 0;

    const solid = this.world.gameContext.blockRegistry
      .getByIdOrThrow(blockId).solid;

    for (const direction of DIRECTIONS) {
      const neighborX = x + direction.x;
      const neighborY = y + direction.y;

      const neighborId = this.world.getBlock(neighborX, neighborY);
      if(neighborId === undefined) continue;

      const neighbourBlock = 
      this.world.gameContext.blockRegistry
      .getByIdOrThrow(
        neighborId
      );

      const neighhbourLight = this.world.getLight(neighborX, neighborY);

      const isHorizontal = direction.y === 0;

      let attenuation = 0;

      if (solid) {
        attenuation = 3;
      } 
      else if (isHorizontal) {
        attenuation = 1;
      } 
      else {
        attenuation = 0;
      }

      maxLight = Math.max(
        maxLight,
        neighhbourLight - attenuation,
      );
    }

    return maxLight;
  }
}

export type LightNode = {
  x: number;
  y: number;
  light: number;
};

const DIRECTIONS = [
  new Vector2(1, 0),
  new Vector2(-1, 0),
  new Vector2(0, 1),
  new Vector2(0, -1),
];