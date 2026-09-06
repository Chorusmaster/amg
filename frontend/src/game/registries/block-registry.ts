import blocksData from "../data/blocks.json";
import AssetManager from "../../engine/asset-manager";
import SpriteSheet from "../../engine/spritesheet";
import { BLOCK_IMAGE_SIZE } from "../data/settings";
import type { SpriteFrame } from "../../engine/sprite";
import Sprite from "../../engine/sprite";

export type Block = (typeof blocksData)[number];

export type BlockVariantRule = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  horizontal?: string;
  vertical?: string;
  default?: boolean;
};

export type BlockContext = {
  top: number | undefined;
  bottom: number | undefined;
  left: number | undefined;
  right: number | undefined;
};

export default class BlockRegistry {
  private assetManager: AssetManager;

  private blocksByName = new Map<string, Block>();
  private blocksById = new Map<number, Block>();
  private blockSpritesheets = new Map<number, SpriteSheet>();

  private constructor(blocks: Block[], assetManager: AssetManager) {
    this.assetManager = assetManager;

    for (const block of blocks) {
      this.blocksById.set(block.id, block);
      this.blocksByName.set(block.name, block);

      if (block.textureType === "spritesheet") {
        if (block.texture === null)
          throw new Error("Block with no texture can't have spritesheet");
        const spritesheet = new SpriteSheet(
          assetManager.getImage(block.texture),
          BLOCK_IMAGE_SIZE,
          BLOCK_IMAGE_SIZE,
        );
        this.blockSpritesheets.set(block.id, spritesheet);
      }
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

  getBlockVariationSprite(blockId: number, variantName: string): Sprite {
    const block = this.getByIdOrThrow(blockId);

    if (block.textureType !== "spritesheet") {
      throw new Error(`Block "${block.name}" doesn't use a spritesheet`);
    }

    const variant = block.variants?.find(
      (variant) => variant.name === variantName,
    );

    if (!variant) {
      throw new Error(
        `Variant "${variantName}" not found for block "${block.name}"`,
      );
    }

    const spritesheet = this.blockSpritesheets.get(blockId);

    if (!spritesheet) {
      throw new Error(`Spritesheet for block "${block.name}" is not loaded`);
    }

    return new Sprite(
      spritesheet.image,
      spritesheet.getFrame(variant.spriteIndex),
    );
  }

  getBlockSpriteByContext(
    blockId: number,
    context: BlockContext,
  ): Sprite | null {
    const block = this.getByIdOrThrow(blockId);

    if (!block.variants) {
      throw new Error(`Block "${block.name}" doesn't use different variants`);
    }

    let defaultVariant = null;

    for (const variant of block.variants) {
      if (variant.rule.default) {
        defaultVariant = variant;
        continue;
      }

      if (this.matchesRule(blockId, variant.rule, context)) {
        return this.getBlockVariationSprite(blockId, variant.name);
      }
    }

    if (defaultVariant) {
      return this.getBlockVariationSprite(blockId, defaultVariant.name);
    }

    return null;
  }

  private matchesRule(
    blockId: number,
    rule: BlockVariantRule,
    context: BlockContext,
  ): boolean {
    if (rule.bottom === "same" && blockId !== context.bottom) return false;
    if (rule.bottom === "other" && blockId === context.bottom) return false;
    if (rule.bottom === "none" && context.bottom !== 0) return false;
    if (rule.bottom === "other_solid") {
      if (!context.bottom) {
        return false;
      }

      const bottomBlock = this.getByIdOrThrow(context.bottom);

      if (context.bottom === blockId || !bottomBlock.solid) {
        return false;
      }
    }

    if (rule.top === "same" && blockId !== context.top) return false;
    if (rule.top === "other" && blockId === context.top) return false;
    if (rule.top === "none" && context.top !== 0) return false;
    if (rule.top === "other_solid") {
      if (!context.top) {
        return false;
      }

      const bottomBlock = this.getByIdOrThrow(context.top);

      if (context.top === blockId || !bottomBlock.solid) {
        return false;
      }
    }

    if (rule.right === "same" && blockId !== context.right) return false;
    if (rule.right === "other" && blockId === context.right) return false;
    if (rule.right === "none" && context.right !== 0) return false;
    if (rule.right === "other_solid") {
      if (!context.right) {
        return false;
      }

      const bottomBlock = this.getByIdOrThrow(context.right);

      if (context.right === blockId || !bottomBlock.solid) {
        return false;
      }
    }

    if (rule.left === "same" && blockId !== context.left) return false;
    if (rule.left === "other" && blockId === context.left) return false;
    if (rule.left === "none" && context.left !== 0) return false;
    if (rule.left === "other_solid") {
      if (!context.left) {
        return false;
      }

      const bottomBlock = this.getByIdOrThrow(context.left);

      if (context.left === blockId || !bottomBlock.solid) {
        return false;
      }
    }

    if (
      rule.horizontal === "same" &&
      blockId !== context.left &&
      blockId !== context.right
    )
      return false;

    if (
      rule.horizontal === "other" &&
      blockId === context.left &&
      blockId === context.right
    )
      return false;

    if (rule.horizontal === "none" && context.left !== 0 && context.right !== 0)
      return false;

    if (
      rule.vertical === "same" &&
      blockId !== context.top &&
      blockId !== context.bottom
    )
      return false;

    if (
      rule.vertical === "other" &&
      blockId === context.top &&
      blockId === context.bottom
    )
      return false;

    if (rule.vertical === "none" && context.top !== 0 && context.bottom !== 0)
      return false;

    return true;
  }

  static async create(assetManager: AssetManager) {
    const textures = blocksData.map((block) => block.texture);

    await Promise.all(
      textures.map(
        (texture) =>
          texture &&
          assetManager.loadImage(texture, `/assets/blocks/${texture}.png`),
      ),
    );

    return new BlockRegistry(blocksData, assetManager);
  }
}
