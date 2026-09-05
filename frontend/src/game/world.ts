import type Camera from "../engine/camera";
import Entity from "../engine/entity";
import type Renderer from "../engine/renderer";
import Vector2 from "../engine/vector2";
import Chunk from "./chunk";
import WorldGenerator from "./world-generator";
import type CollisionWorld from "../engine/physics/collision-world";
import AABB from "../engine/physics/AABB";
import type WorldCollider from "../engine/physics/world-collider";
import ItemStack from "./item-stack";

import {
  BACKGROUND_TINT,
  BLOCK_SIZE,
  CHUNK_SIZE,
  LOADED_CHUNKS_X,
  LOADED_CHUNKS_Y,
  MAX_LIGHT
} from "./data/settings";

import Collider from "../engine/physics/collider";
import Transform from "../engine/transform";
import GameContext from "./game-context";
import type AssetManager from "../engine/asset-manager";
import type BlockRegistry from "./block-registry";
import type ItemRegistry from "./item-registry";
import LightSystem from "./light-system";

export default class World implements CollisionWorld {
  private entities: Entity[] = [];
  private chunks = new Map<string, Chunk>();
  private blockRegistry: BlockRegistry;
  private itemRegistry: ItemRegistry;
  private assetManager: AssetManager;

  readonly lightSystem: LightSystem;
  readonly worldGenerator: WorldGenerator;
  readonly gameContext: GameContext;
  readonly seed: string;
  readonly gravityAcceleration = 500;

  readonly surfaceY = new Map<number, number>();

  constructor(gameContext: GameContext, seed?: string) {
    if (!seed) seed = Math.random().toString();
    this.seed = seed;

    this.gameContext = gameContext;
    this.assetManager = gameContext.assetManager;
    this.blockRegistry = gameContext.blockRegistry;
    this.itemRegistry = gameContext.itemRegistry;
    this.worldGenerator = new WorldGenerator(this.seed, this);
    this.lightSystem = new LightSystem(this);
  }

  // ENTITIES

  get entitiesList() {
    return this.entities;
  }

  add(entity: Entity) {
    entity.setWorld(this);
    this.entities.push(entity);
    entity.onAddedToWorld();
  }

  remove(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index !== -1) {
      this.entities.splice(index, 1);
    }
  }

  // COORDINATES

  worldToBlockCoords(position: Vector2): Vector2 {
    return new Vector2(
      Math.floor(position.x / BLOCK_SIZE),
      Math.floor(position.y / BLOCK_SIZE),
    );
  }

  // Returns the center of a block in world coordinates
  blockToWorldCoords(x: number, y: number): Vector2 {
    return new Vector2(
      x * BLOCK_SIZE + BLOCK_SIZE * 0.5,
      y * BLOCK_SIZE + BLOCK_SIZE * 0.5,
    );
  }

  private worldToChunkCoord(blockCoord: number): number {
    return Math.floor(blockCoord / CHUNK_SIZE);
  }

  private worldToLocalCoord(blockCoord: number): number {
    return ((blockCoord % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  }

  // BLOCKS

  getBlock(x: number, y: number) {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.chunks.get(`${chunkX},${chunkY}`);
    if (!chunk) return undefined;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    return chunk.getForeground(localX, localY);
  }

  setBlock(x: number, y: number, block: number) {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.chunks.get(`${chunkX},${chunkY}`);
    if (!chunk) return;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    const oldBlockId = this.getBlock(x, y);

    if (block == 0) {
      if (!oldBlockId) return;

      const oldBlock = this.blockRegistry.getByIdOrThrow(oldBlockId);
      const drops = oldBlock.drops;

      if (drops.length > 0) {
        const texture = this.itemRegistry.getByNameOrThrow(drops[0].item).texture;

        const itemStack = new ItemStack(
          drops,
          this.assetManager.getImage(texture),
          new Vector2(
            x * BLOCK_SIZE + BLOCK_SIZE * 0.5,
            y * BLOCK_SIZE + BLOCK_SIZE * 0.5,
          ),
        );
        this.add(itemStack);
      }
    }
    else  {
      if (this.getBlock(x, y - 1) === this.blockRegistry.getByNameOrThrow("grass").id) {
        this.setBlock(x, y - 1, this.blockRegistry.getByNameOrThrow("dirt").id);
      }
    }

    chunk.setForeground(localX, localY, block);
    this.lightSystem.propagateVerticalSkyLight(chunkX * CHUNK_SIZE + localX);
    
    const light = this.getLight(x, y + 1);

    if (oldBlockId === undefined) return;
  }

  // LIGHT

  getSkyLight(x: number, y: number): number | undefined {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.getChunk(chunkX, chunkY);
    if (!chunk) return undefined;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    return chunk.getSkyLight(localX, localY);
  }

  setSkyLight(x: number, y: number, light: number): void {
    if (light > MAX_LIGHT) {
      light = MAX_LIGHT;
    }

    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.getChunk(chunkX, chunkY);
    if (!chunk) return;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    chunk.setSkyLight(localX, localY, light);
  }

  getLight(x: number, y: number): number | undefined {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.getChunk(chunkX, chunkY);
    if (!chunk) return undefined;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    return chunk.getTotalLight(localX, localY);
  }

  // CHUNKS

  getChunk(x: number, y: number) {
    return this.chunks.get(`${x},${y}`);
  }

  generateChunk(chunkX: number, chunkY: number) {
    const chunk = this.worldGenerator.generateChunk(chunkX, chunkY);
    this.chunks.set(`${chunkX},${chunkY}`, chunk); 

    return chunk;
  }

  // RENDER

  loadNearbyChunks(camera: Camera) {
    const cameraBlockCoords = this.worldToBlockCoords(camera.position);
    const cameraChunkX = this.worldToChunkCoord(cameraBlockCoords.x);
    const cameraChunkY = this.worldToChunkCoord(cameraBlockCoords.y);

    const startX = Math.floor(-LOADED_CHUNKS_X / 2);
    const startY = Math.floor(-LOADED_CHUNKS_Y / 2);

    const endX = startX + LOADED_CHUNKS_X;
    const endY = startY + LOADED_CHUNKS_Y;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const chunkX = x + cameraChunkX;
        const chunkY = y + cameraChunkY;

        if (!this.chunks.has(`${chunkX},${chunkY}`)) {
          this.generateChunk(chunkX, chunkY);
          for (let localX = 0; localX < CHUNK_SIZE; localX++) {
            this.lightSystem.propagateVerticalSkyLight(chunkX * CHUNK_SIZE + localX);
          }
        }
      }
    }
  }

  getShadowTint(lightLevel: number) {
    const brightness = Math.max(0, Math.min(1, lightLevel / MAX_LIGHT));
    return `rgba(0, 0, 0, ${1 - brightness})`;
  }

  renderChunk(key: string, renderer: Renderer, camera: Camera) {
    const [chunkX, chunkY] = key.split(",");
    const chunk = this.chunks.get(key);
    if (!chunk)
      throw new Error("Chunk you are trying to render is not generated yet");

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const foregroundTexture = this.blockRegistry.getByIdOrThrow(chunk.getForeground(x, y)).texture;
        const backgroundTexture = this.blockRegistry.getByIdOrThrow(chunk.getBackground(x, y)).texture;
        
        const backgroundLight = MAX_LIGHT - BACKGROUND_TINT;
        const backgroundTint = this.getShadowTint(backgroundLight);

        const position = this.blockToWorldCoords(
          Number.parseInt(chunkX) * CHUNK_SIZE + x,
          Number.parseInt(chunkY) * CHUNK_SIZE + y,
        );

        if (backgroundLight == 0) {
          renderer.drawWorldRect(
            camera,
            position,
            new Vector2(BLOCK_SIZE, BLOCK_SIZE),
            this.getShadowTint(0)
          );
        } else {
          if (foregroundTexture) {
              renderer.drawWorldImage(
              this.assetManager.getImage(foregroundTexture),
              camera,
              position,
              new Vector2(BLOCK_SIZE, BLOCK_SIZE),
            );
          } else if (backgroundTexture) {
            renderer.drawWorldImage(
              this.assetManager.getImage(backgroundTexture),
              camera,
              position,
              new Vector2(BLOCK_SIZE, BLOCK_SIZE),
              backgroundTint
            );
          }
        }
      }
    }
  }

  render(renderer: Renderer, camera: Camera) {
    this.loadNearbyChunks(camera); // Тимчасово

    const cameraBlockCoords = this.worldToBlockCoords(camera.position);
    const cameraChunkX = this.worldToChunkCoord(cameraBlockCoords.x);
    const cameraChunkY = this.worldToChunkCoord(cameraBlockCoords.y);

    const chunkPixelSize = CHUNK_SIZE * BLOCK_SIZE;

    const visibleChunksX = Math.ceil(camera.viewport.x / chunkPixelSize) + 1;
    const visibleChunksY = Math.ceil(camera.viewport.y / chunkPixelSize) + 1;

    const startX = Math.floor(-visibleChunksX / 2);
    const startY = Math.floor(-visibleChunksY / 2);

    const endX = startX + visibleChunksX;
    const endY = startY + visibleChunksY;

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const chunkKey = `${cameraChunkX + x},${cameraChunkY + y}`;
        if (this.chunks.has(chunkKey)) {
          this.renderChunk(chunkKey, renderer, camera);
        } else {
          console.warn(`Chunk ${chunkKey} hasn't been generated before render`);
          this.generateChunk(cameraChunkX + x, cameraChunkY + y);
          this.renderChunk(chunkKey, renderer, camera);
        }
      }

      const chunkX = cameraChunkX + x;

      for (let localX = 0; localX < CHUNK_SIZE; localX++) {
        const blockX = localX + chunkX * CHUNK_SIZE;

        if (!this.lightSystem.generatedX.has(blockX)) {
          this.lightSystem.propagateVerticalSkyLight(blockX);
          this.lightSystem.processPendingWaves();
        }
      }
    }

    for (const entity of this.entities) {
      entity.render(renderer, camera);
    }
  }

  // COLLISIONS

  //world coords
  getBlockBounds(coords: Vector2) {
    return new AABB(
      new Vector2(coords.x - BLOCK_SIZE / 2, coords.y - BLOCK_SIZE / 2),
      new Vector2(coords.x + BLOCK_SIZE / 2, coords.y + BLOCK_SIZE / 2),
    );
  }

  query(bounds: AABB): WorldCollider[] {
    const minBlockCoords = this.worldToBlockCoords(bounds.min);
    const maxBlockCoords = this.worldToBlockCoords(bounds.max);

    const worldColliders: WorldCollider[] = [];

    for (let y = minBlockCoords.y; y <= maxBlockCoords.y; y++) {
      for (let x = minBlockCoords.x; x <= maxBlockCoords.x; x++) {
        const block = this.getBlock(x, y);

        if (!block) continue;
        if (!this.blockRegistry.getById(block)?.solid) continue;

        const collider = new Collider(
          new Vector2(BLOCK_SIZE, BLOCK_SIZE),
          new Vector2(),
        );
        const transform = new Transform(
          this.blockToWorldCoords(x, y),
          new Vector2(BLOCK_SIZE, BLOCK_SIZE)
        )

        worldColliders.push({
          collider,
          transform,
        });
      }
    }

    return worldColliders;
  }

  renderChunkLighting(
    key: string,
    renderer: Renderer,
    camera: Camera
  ) {
    const [chunkX, chunkY] = key.split(",");
    const chunk = this.chunks.get(key);

    if (!chunk)
      throw new Error("Chunk you are trying to render is not generated yet");

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const light = chunk.getTotalLight(x, y);
        const tint = this.getShadowTint(light);

        const position = this.blockToWorldCoords(
          Number.parseInt(chunkX) * CHUNK_SIZE + x,
          Number.parseInt(chunkY) * CHUNK_SIZE + y,
        );

        renderer.drawWorldRect(
          camera,
          position,
          new Vector2(BLOCK_SIZE, BLOCK_SIZE),
          tint
        );
      }
    }
  }

  renderLightning(renderer: Renderer, camera: Camera) {
    const cameraBlockCoords = this.worldToBlockCoords(camera.position);
    const cameraChunkX = this.worldToChunkCoord(cameraBlockCoords.x);
    const cameraChunkY = this.worldToChunkCoord(cameraBlockCoords.y);

    const chunkPixelSize = CHUNK_SIZE * BLOCK_SIZE;

    const visibleChunksX = Math.ceil(camera.viewport.x / chunkPixelSize) + 1;
    const visibleChunksY = Math.ceil(camera.viewport.y / chunkPixelSize) + 1;

    const startX = Math.floor(-visibleChunksX / 2);
    const startY = Math.floor(-visibleChunksY / 2);

    const endX = startX + visibleChunksX;
    const endY = startY + visibleChunksY;

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const chunkKey = `${cameraChunkX + x},${cameraChunkY + y}`;
        if (this.chunks.has(chunkKey)) {
          this.renderChunkLighting(chunkKey, renderer, camera);
        } 
      }
    }
  }
}
