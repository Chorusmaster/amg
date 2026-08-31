import type Camera from "../engine/camera";
import Entity from "../engine/entity";
import type Renderer from "../engine/renderer";
import Vector2 from "../engine/vector2";
import Block from "./block";
import Chunk from "./chunk";
import WorldGenerator from "./world-generator";
import type CollisionWorld from "../engine/physics/collision-world";
import AABB from "../engine/physics/AABB";

import { 
  BLOCK_SIZE, 
  CHUNK_SIZE, 
  LOADED_CHUNKS_X, 
  LOADED_CHUNKS_Y 
} from "./data/settings";

export default class World implements CollisionWorld {
  private entities: Entity[] = [];
  private chunks = new Map<string, Chunk>();
  private blocksRegistryList: Block[];
  private worldGenerater: WorldGenerator;
  readonly gravityAcceleration = 400;

  constructor(blocksRegistryList: Block[]) {
    this.blocksRegistryList = blocksRegistryList;
    this.worldGenerater = new WorldGenerator();
  }

  // ENTITIES

  get entitiesList() {
    return this.entities;
  }

  add(entity: Entity) {
    this.entities.push(entity);
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

  isSolid(blockId: number) {
    return this.blocksRegistryList[blockId].solid;
  }

  getBlock(x: number, y: number) {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.chunks.get(`${chunkX},${chunkY}`);
    if (!chunk) return undefined;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    return chunk.get(localX, localY);
  }

  setBlock(x: number, y: number, block: number) {
    const chunkX = this.worldToChunkCoord(x);
    const chunkY = this.worldToChunkCoord(y);

    const chunk = this.chunks.get(`${chunkX},${chunkY}`);
    if (!chunk) return undefined;

    const localX = this.worldToLocalCoord(x);
    const localY = this.worldToLocalCoord(y);

    chunk.set(localX, localY, block);
  }

  // CHUNKS

  getChunk(x: number, y: number) {
    return this.chunks.get(`${x},${y}`);
  }

  generateChunk(chunkX: number, chunkY: number) {
    const chunk = this.worldGenerater.generateChunk(chunkX, chunkY);
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
        }
      }
    }
  }

  renderChunk(key: string, renderer: Renderer, camera: Camera) {
    const [chunkX, chunkY] = key.split(",");
    const chunk = this.chunks.get(key);
    if (!chunk) throw new Error("Chunk you are trying to render is not generated yet");

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const texture = this.blocksRegistryList[chunk.get(x, y)].texture;
        if (!texture) continue;

        const position = this.blockToWorldCoords(
          Number.parseInt(chunkX) * CHUNK_SIZE + x,
          Number.parseInt(chunkY) * CHUNK_SIZE + y,
        );

        renderer.drawWorldImage(
          texture,
          camera,
          position,
          new Vector2(BLOCK_SIZE, BLOCK_SIZE),
        );
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

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const chunkKey = `${cameraChunkX + x},${cameraChunkY + y}`;
        if (this.chunks.has(chunkKey)) {
          this.renderChunk(chunkKey, renderer, camera);
        } else {
          console.warn(`Chunk ${chunkKey} hasn't been generated before render`);
          this.generateChunk(cameraChunkX + x, cameraChunkY + y);
          this.renderChunk(chunkKey, renderer, camera);
        }
      }
    }

    for (const entity of this.entities) {
      renderer.drawWorldImage(
        entity.image,
        camera,
        entity.transform.position,
        entity.transform.scale,
      );
    }
  }

  // COLLISIONS

  //world coords
  getBlockBounds(coords: Vector2) {
    return new AABB(
      new Vector2(coords.x - BLOCK_SIZE / 2, coords.y - BLOCK_SIZE / 2),
      new Vector2(coords.x + BLOCK_SIZE / 2, coords.y + BLOCK_SIZE / 2)
    )
  }

  getCollisions(bounds: AABB): AABB[] {
    const minBlockCoords = this.worldToBlockCoords(bounds.min);
    const maxBlockCoords = this.worldToBlockCoords(bounds.max);

    const collisions: AABB[] = [];

    for (let y = minBlockCoords.y; y <= maxBlockCoords.y; y++) {
      for (let x = minBlockCoords.x; x <= maxBlockCoords.x; x++) {
        const block = this.getBlock(x, y);
        
        if (!block) continue;
        if (!this.isSolid(block)) continue;

        const bounds = this.getBlockBounds(this.blockToWorldCoords(x, y));

        collisions.push(
          bounds
        );
      }
    }

    return collisions;
  }
}