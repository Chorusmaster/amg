import Chunk from "./chunk";
import { CHUNK_SIZE } from "./data/settings";

export default class WorldGenerator {
  generateChunk(chunkX: number, chunkY: number): Chunk {
    const chunk = new Chunk();
    
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const blockX = chunkX * CHUNK_SIZE + x;
        const blockY = chunkY * CHUNK_SIZE + y;

        let blockType = 0;
        if (blockY == 0) blockType = 2;
        else if (blockY < 0 && blockY >= -6) blockType = 1;
        else if (blockY < -6) blockType = 3;
          
        chunk.set(x, y, blockType);
      }
    }

    return chunk;
  }
}