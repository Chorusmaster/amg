import Vector2 from "../engine/vector2";
import type World from "./world";
import { CHUNK_SIZE, MAX_LIGHT } from "./data/settings";

export default class LightSystem {
  private readonly world: World;
  readonly generatedX = new Set<number>();
  private pendingWaves: LightWave[] = [];

  constructor(world: World) {
    this.world = world;
  }

  update(): void {
    
  }

  setBlock(): void {

  }

  recalculateSunlight(): void{

  }

  propagateLight(): void {

  }

  propagateVerticalSkyLight(x: number): void {
    const surfaceY = this.world.surfaceY.get(x);
    if (surfaceY === undefined) return;

    let topY = surfaceY;

    while (this.world.getBlock(x, topY + 1) !== undefined) {
      topY++;
    }

    const topBlockId = this.world.getBlock(x, topY);
    if (topBlockId === undefined) return;

    const topBlock = this.world.gameContext.blockRegistry
      .getByIdOrThrow(topBlockId);

    if (topY <= surfaceY || topBlock.solid) {
      let y = surfaceY;

      while (this.world.getBlock(x, y) !== undefined) {
        this.world.setSkyLight(x, y, 0);
        y--;
      }

      return;
    }

    let y = topY;
    let firstSolidBlockY = undefined;

    while (true) {
      const blockId = this.world.getBlock(x, y);
      if (blockId === undefined) break;

      this.world.setSkyLight(x, y, MAX_LIGHT);

      const block = this.world.gameContext.blockRegistry
        .getByIdOrThrow(blockId);

      if (block.solid) {
        firstSolidBlockY = y;

        while (true) {
          const shadowBlock = this.world.getBlock(x, y);
          if (shadowBlock === undefined) break;

          this.world.setSkyLight(x, y, 0);
          y--;
        }

        break;
      }

      y--;
    }

    if (firstSolidBlockY !== undefined) {
      this.startLightWave({
        x,
        y: firstSolidBlockY,
        direction: "down",
        light: MAX_LIGHT
      });

      this.generatedX.add(x);
    }
  }

  startLightWave(initialWave: LightWave): void {
    const queue: LightWave[] = [initialWave];

    while (queue.length > 0) {
      const wave = queue.shift()!;

      const currentLight = this.world.getSkyLight(wave.x, wave.y);

      if (currentLight === undefined) {
        this.pendingWaves.push(wave);
        continue;
      }
      if (currentLight >= wave.light) continue;

      this.world.setSkyLight(wave.x, wave.y, wave.light);

      const blockId = this.world.getBlock(wave.x, wave.y);
      if (blockId === undefined) {
        this.pendingWaves.push(wave);
        continue;
      }

      const block = this.world.gameContext.blockRegistry
        .getByIdOrThrow(blockId);

      const newLight = wave.light - block.lightOpacity;

      if (newLight <= 0) continue;

      const directions = WAVE_DIRECTIONS[wave.direction];

      queue.push(
        this.newWaveFromDirection(wave, newLight, directions.firstCheck),
        this.newWaveFromDirection(wave, newLight, directions.secondCheck),
        this.newWaveFromDirection(wave, newLight, directions.thirdCheck)
      );
    }
  }

  newWaveFromDirection(oldWave: LightWave, light: number, direction: Direction): LightWave {
    const vector = CHECK_DIRECTIONS[direction];

    return {
      x: oldWave.x + vector.x,
      y: oldWave.y + vector.y,
      light: light,
      direction
    };
  }

  processPendingWaves(): void {
    const waves = this.pendingWaves;

    this.pendingWaves = [];

    for (const wave of waves) {
      this.startLightWave(wave);
    }
  }
}

export type LightWave = {
  x: number;
  y: number;
  direction: Direction;
  light: number;
};

const CHECK_DIRECTIONS = {
  right: new Vector2(1, 0),
  left: new Vector2(-1, 0),
  up: new Vector2(0, 1),
  down: new Vector2(0, -1),
} as const;

type Direction = keyof typeof WAVE_DIRECTIONS;

const WAVE_DIRECTIONS = {
  right: {
    firstCheck: "up",
    secondCheck: "right",
    thirdCheck: "down"
  },
  left: {
    firstCheck: "up",
    secondCheck: "left",
    thirdCheck: "down"
  },
  up: {
    firstCheck: "right",
    secondCheck: "up",
    thirdCheck: "left"
  },
  down: {
    firstCheck: "right",
    secondCheck: "down",
    thirdCheck: "left"
  }
} as const;

type Neighbor = {
  position: Vector2;
  direction: Vector2;
};