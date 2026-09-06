import type AssetManager from "../engine/asset-manager";
import type Input from "../engine/input";
import type Vector2 from "../engine/vector2";
import type BlockRegistry from "./registries/block-registry";
import Inventory from "./inventory/inventory";
import type ItemRegistry from "./registries/item-registry";
import type BiomeRegistry from "./registries/biome-registry";
import type { DayNightState } from "./day-night-system";

export default class GameContext {
  readonly assetManager: AssetManager;
  readonly input: Input;

  readonly blockRegistry: BlockRegistry;
  readonly itemRegistry: ItemRegistry;
  readonly biomeRegistry: BiomeRegistry;

  readonly inventory: Inventory;
  readonly viewport: Vector2;

  public dayNightState: DayNightState = {
    sunBrightness: 1,
    skyColor: "skyblue"
  };

  constructor(
    input: Input,
    assetManager: AssetManager,
    blockRegistry: BlockRegistry,
    itemRegistry: ItemRegistry,
    biomeRegistry: BiomeRegistry,
    viewport: Vector2,
  ) {
    this.input = input;
    this.assetManager = assetManager;
    
    this.blockRegistry = blockRegistry;
    this.itemRegistry = itemRegistry;
    this.biomeRegistry = biomeRegistry;

    this.inventory = new Inventory(this);
    this.viewport = viewport;
  }
}
