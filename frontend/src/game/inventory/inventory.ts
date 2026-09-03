import type AssetManager from "../../engine/asset-manager";
import type Renderer from "../../engine/renderer";
import Vector2 from "../../engine/vector2";
import type GameContext from "../game-context";
import type ItemRegistry from "../item-registry";
import type { ItemEntry } from "../item-stack";
import type Input from "../../engine/input";

const MAX_STACK = 99;
const SLOT_SIZE = 64;
const SLOT_ITEM_SIZE = 32;
const SLOT_ROWS = 1;
const SLOTS_IN_ROW = 10;
const BOTTOM_MARGIN = 72;

type InventorySlot = {
  item: string,
  quantity: number
} | null

export default class Inventory {
  private itemRegistry: ItemRegistry;
  private assetManager: AssetManager;
  private viewport: Vector2;
  private input: Input;

  readonly slots: InventorySlot[];
  private selectedSlot = 0;
  private cursorItem: ItemEntry | null = null;

  getSlotIdByClickPos(position: Vector2): number | null {
    const inventoryWidth = SLOT_SIZE * SLOTS_IN_ROW;
    const marginX = (this.viewport.x - inventoryWidth) / 2;
    const y = this.viewport.y - BOTTOM_MARGIN;

    const x = position.x - marginX;
    const relativeY = position.y - y;

    if (
      x < 0 ||
      x >= inventoryWidth ||
      relativeY < 0 ||
      relativeY >= SLOT_SIZE
    ) {
      return null;
    }

    return Math.floor(x / SLOT_SIZE);
  }

  /** Function adds as much as possible items to inventory and returns remaining */
  add(entry: ItemEntry): ItemEntry | null {
    // Fill existing stacks
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];

      if (slot === null || slot.item !== entry.item)
        continue;

      const totalQuantity = slot.quantity + entry.quantity;

      if (totalQuantity <= MAX_STACK) {
        slot.quantity = totalQuantity;
        return null;
      }

      slot.quantity = MAX_STACK;

      entry = {
        item: entry.item,
        quantity: totalQuantity - MAX_STACK
      };
    }

    // Fill empty slots
    for (let i = 0; i < this.slots.length; i++) {
      if (this.slots[i] !== null)
        continue;

      if (entry.quantity <= MAX_STACK) {
        this.slots[i] = entry;
        return null;
      }

      this.slots[i] = {
        item: entry.item,
        quantity: MAX_STACK
      };

      entry = {
        item: entry.item,
        quantity: entry.quantity - MAX_STACK
      };
    }

    return entry;
  }

  selectNext() {
    this.selectedSlot =
      (this.selectedSlot + 1) % SLOTS_IN_ROW;
  }

  selectPrevious() {
    this.selectedSlot =
      (this.selectedSlot - 1 + SLOTS_IN_ROW) % SLOTS_IN_ROW;
  }

  get activeSlot() {
    return this.selectedSlot;
  }

  get heldItem() {
    return this.cursorItem;
  }

  take(slotId: number) {
    if (this.cursorItem !== null)
      return;

    const slot = this.slots[slotId];

    if (!slot)
      return;

    this.cursorItem = slot;
    this.slots[slotId] = null;
  }

  place(slotId: number) {
    if (!this.cursorItem)
      return;

    const slot = this.slots[slotId];

    if (!slot) {
      this.slots[slotId] = this.cursorItem;
      this.cursorItem = null;
      return;
    }

    if (slot.item === this.cursorItem.item) {
      const total = slot.quantity + this.cursorItem.quantity;

      slot.quantity = Math.min(total, MAX_STACK);

      if (total <= MAX_STACK) {
        this.cursorItem = null;
      } else {
        this.cursorItem.quantity = total - MAX_STACK;
      }

      return;
    }

    const oldSlot = this.slots[slotId];
    this.slots[slotId] = this.cursorItem;
    this.cursorItem = oldSlot;
  }

  takeOutside() {
    const item = this.cursorItem;
    this.cursorItem = null;

    return item;
  }

  removeQuantity(slotId: number, quantity: number) {
    const slotData = this.slots[slotId];

    if (!slotData) {
      throw new Error("This slot is empty");
    }

    const newQuantity = slotData.quantity - quantity;

    if (newQuantity < 0) {
      throw new Error("Slot cannot have negative quantity");
    }

    if (newQuantity === 0) {
      this.slots[slotId] = null;
    } else {
      this.slots[slotId] = {
        item: slotData.item,
        quantity: newQuantity
      };
    }
  }

  render(renderer: Renderer) {
    const marginX = (this.viewport.x - (SLOT_SIZE * SLOTS_IN_ROW)) / 2;
    for (let i = 0; i < SLOTS_IN_ROW; i++) {
      const slotPosition = new Vector2(
        Math.round(marginX + i * SLOT_SIZE),
        Math.round(this.viewport.y - BOTTOM_MARGIN)
      );

      const itemPosition = slotPosition.addScalar(Math.round(SLOT_SIZE / 4));
      const textPosition = slotPosition.addScalar(Math.round(SLOT_SIZE / 8 * 7));

      const slotSize = new Vector2(SLOT_SIZE, SLOT_SIZE);
      const itemSize = new Vector2(SLOT_ITEM_SIZE, SLOT_ITEM_SIZE);

      const slotImage = i === this.selectedSlot ?
        this.assetManager.getImage("inventory_slot_selected") :
        this.assetManager.getImage("inventory_slot");

      renderer.drawImage(
        slotImage, 
        slotPosition, 
        slotSize
      );

      const entry = this.slots[i];
      if (entry) {
        renderer.drawImage(this.assetManager.getImage(entry.item), itemPosition, itemSize);
        renderer.drawText(entry.quantity.toString(), textPosition)
      }
    }

    if (this.cursorItem) {
      renderer.drawImage(
        this.assetManager.getImage(this.cursorItem.item),
        this.input.mousePosition.addScalar(-SLOT_ITEM_SIZE / 2),
        new Vector2(SLOT_ITEM_SIZE, SLOT_ITEM_SIZE)
      );

      renderer.drawText(
        this.cursorItem.quantity.toString(),
        this.input.mousePosition.addScalar(SLOT_ITEM_SIZE / 4 * 3),
      );
    }
  }

  constructor(gameContext: GameContext) {
    this.assetManager = gameContext.assetManager;
    this.itemRegistry = gameContext.itemRegistry;
    this.viewport = gameContext.viewport;
    this.input = gameContext.input;
    this.slots = Array(SLOT_ROWS * SLOTS_IN_ROW).fill(null);
  }
}