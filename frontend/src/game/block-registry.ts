import Block from "./block";
import blocksData from "./data/blocks.json";
import AssetManager from "../engine/asset-manager";

export default class BlockRegistry {
  readonly blocksRegistry: Block[];

  private constructor(blocks: Block[]) {
    this.blocksRegistry = blocks;
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

    const blocks = blocksData.map(
      (data, index) =>
        new Block(
          index,
          data.name,
          data.solid,
          data.texture ? assetManager.getImage(data.texture) : null
        )
    );

    return new BlockRegistry(blocks);
  }
}