import blocksData from "./data/blocks.json";
import AssetManager from "../engine/asset-manager";

export type Block = typeof blocksData[number];

export default class BlockRegistry {
  private blocksByName = new Map<string, Block>();
  private blocksById = new Map<number, Block>();

  private constructor(blocks: Block[]) {
    for (const block of blocks) {
      this.blocksById.set(block.id, block);
      this.blocksByName.set(block.name, block);
    }
  }

  getById(id: number) {
    return this.blocksById.get(id);
  }

  getByIdOrThrow(id: number): Block {
    const block = this.blocksById.get(id);

    if (!block) {
      throw new Error(`Block with id ${id} not found`);
    }

    return block;
  }

  getByName(name: string) {
    return this.blocksByName.get(name);
  }

  getByNameOrThrow(name: string): Block {
    const block = this.blocksByName.get(name);

    if (!block) {
      throw new Error(`Block with name ${name} not found`);
    }

    return block;
  }

  static async create(assetManager: AssetManager) {
    const textures = blocksData.map(block => block.texture);

    await Promise.all(
      textures.map(texture =>
        texture &&
        assetManager.loadImage(
          texture,
          `/assets/blocks/${texture}.png`
        )
      )
    );

    return new BlockRegistry(blocksData);
  }
}