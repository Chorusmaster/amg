import Vector2 from "../engine/vector2";
import type World from "./world";
import { CHUNK_SIZE, MAX_LIGHT } from "./data/settings";
import type Chunk from "./chunk";

export default class LightSystem {
  private readonly world: World;

  constructor(
    world: World
  ) {
    this.world = world;
  }

  setupChunkSunlight(
    chunk: Chunk,
    chunkX: number,
    chunkY: number,
  ): void {
    const startX = chunkX * CHUNK_SIZE;
    const startY = chunkY * CHUNK_SIZE;

    for (let localX = 0; localX < CHUNK_SIZE; localX++) {
      const worldX = startX + localX;
      const surfaceHeight = this.world.worldGenerator
        .getSurfaceHeight(worldX);

      if (startY >= surfaceHeight) {
        this.spreadSunlight(
          worldX,
          startY,
          MAX_LIGHT
        );
      }
    }
  }

  spreadSunlight(
    x: number,
    y: number,
    light: number,
  ): void {
    this.world.setLight(x, y, light);

    const queue: LightNode[] = [
      {
        x,
        y,
        light,
      },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const direction of SUNLIGHT_DIRECTIONS) {
        const newX = current.x + direction.x;
        const newY = current.y + direction.y;

        const blockId = this.world.getBlock(newX, newY);
        if (blockId === undefined) continue;

        const block = this.world.gameContext.blockRegistry
          .getByIdOrThrow(blockId);

        let newLight = current.light;

        if (block.solid) {
          newLight -= 4;
        }

        if (newLight <= 0) continue;

        const oldLight = this.world.getLight(newX, newY);

        if (oldLight >= newLight) continue;

        this.world.setLight(
          newX,
          newY,
          newLight,
        );

        queue.push({
          x: newX,
          y: newY,
          light: newLight,
        });
      }
    }
  }

  // spreadLight(startX: number, startY: number, light: number): void {
  //   const queue: LightNode[] = [
  //     {
  //       x: startX,
  //       y: startY,
  //       light,
  //     },
  //   ];

  //   while (queue.length > 0) {
  //     const current = queue.shift()!;

  //     if (current.light <= 1) {
  //       continue;
  //     }

  //     for (const direction of DIRECTIONS) {
  //       const x = current.x + direction.x;
  //       const y = current.y + direction.y;

  //       const block = this.world.getBlock(x, y);

  //       if (block === undefined) {
  //         continue;
  //       }

  //       const nextLight = this.calculateLight(
  //         x,
  //         y,
  //         current.light,
  //       );

  //       if (nextLight <= 1) {
  //         continue;
  //       }

  //       const currentLight = this.world.getLight(x, y);

  //       if (nextLight <= currentLight) {
  //         continue;
  //       }

  //       this.world.setLight(x, y, nextLight);

  //       queue.push({
  //         x,
  //         y,
  //         light: nextLight,
  //       });
  //     }
  //   }
  // }

  private calculateLight(
    x: number,
    y: number,
    light: number,
  ): number {
    const blockId = this.world.getBlock(x, y);

    if (blockId === undefined) {
      return 0;
    }

    const block = this.world.gameContext.blockRegistry
      .getByIdOrThrow(blockId);

    if (block.solid) {
      return Math.max(0, light - 3);
    }

    return Math.max(0, light - 1);
  }
}

type LightNode = {
  x: number;
  y: number;
  light: number;
};

const SUNLIGHT_DIRECTIONS = [
  new Vector2(1, 0),
  new Vector2(-1, 0),
  new Vector2(0, -1),
];

const DIRECTIONS = [
  new Vector2(1, 0),
  new Vector2(-1, 0),
  new Vector2(0, 1),
  new Vector2(0, -1),
];