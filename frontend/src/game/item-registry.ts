import itemsData from "./data/items.json";
import AssetManager from "../engine/asset-manager";
import type BlockRegistry from "./block-registry";

export type Item = typeof itemsData[number];

export default class ItemRegistry {
  private itemsByName = new Map<string, Item>();
  private itemsById = new Map<number, Item>();

  private constructor(items: Item[]) {
    for (const item of items) {
      this.itemsById.set(item.id, item);
      this.itemsByName.set(item.name, item);
    }
  }

  getById(id: number) {
    return this.itemsById.get(id);
  }

  getByIdOrThrow(id: number): Item {
    const item = this.itemsById.get(id);

    if (!item) {
      throw new Error(`Item with id ${id} not found`);
    }

    return item;
  }

  getByName(name: string) {
    return this.itemsByName.get(name);
  }

  getByNameOrThrow(name: string): Item {
    const item = this.itemsByName.get(name);

    if (!item) {
      throw new Error(`Item with name ${name} not found`);
    }

    return item;
  }

  static async create(assetManager: AssetManager, blockRegistry: BlockRegistry) {
    const textures = itemsData.filter(item => item.type == "item").map(item => item.texture);

    await Promise.all(
      textures.map(texture =>
        texture &&
        assetManager.loadImage(
          texture,
          `/assets/items/${texture}.png`
        )
      )
    );

    const blockItems = itemsData.filter(item => item.type == "block");
    for (const item of blockItems) {
      if (!item.block || !blockRegistry.getByName(item.block)) {
        throw new Error(`Linked block to item ${item.name} doesn't exist`)
      }
    }

    return new ItemRegistry(itemsData);
  }
}