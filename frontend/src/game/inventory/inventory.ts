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

export type InventorySlot = {
  item: string;
  quantity: number;
} | null;

export type InventorySnapshot = {
  slots: InventorySlot[];
  activeSlot: number;
  heldItem: ItemEntry | null;
};

export default class Inventory {
  private itemRegistry: ItemRegistry;
  private assetManager: AssetManager;
  private viewport: Vector2;

  private listeners = new Set<() => void>();

  private slots: InventorySlot[];
  private selectedSlot = 0;
  private cursorItem: ItemEntry | null = null;

  private snapshot: InventorySnapshot;

  constructor(gameContext: GameContext) {
    this.assetManager = gameContext.assetManager;
    this.itemRegistry = gameContext.itemRegistry;
    this.viewport = gameContext.viewport;

    this.slots = Array(SLOT_ROWS * SLOTS_IN_ROW).fill(null);

    this.snapshot = {
      slots: this.slots,
      activeSlot: this.selectedSlot,
      heldItem: this.cursorItem
    };
  }

  /** Adds as many items as possible and returns remained */
  add(entry: ItemEntry): ItemEntry | null {
    let remaining = entry.quantity;
    let changed = false;

    const slots = [...this.slots];

    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const slot = slots[i];

      if (!slot || slot.item !== entry.item)
        continue;

      const space = MAX_STACK - slot.quantity;

      if (space <= 0)
        continue;

      const amount = Math.min(space, remaining);

      slots[i] = {
        item: slot.item,
        quantity: slot.quantity + amount
      };

      remaining -= amount;
      changed = true;
    }

    for (let i = 0; i < slots.length && remaining > 0; i++) {
      if (slots[i] !== null)
        continue;

      const amount = Math.min(MAX_STACK, remaining);

      slots[i] = {
        item: entry.item,
        quantity: amount
      };

      remaining -= amount;
      changed = true;
    }

    if (!changed)
      return entry;

    this.slots = slots;
    this.notify();

    return remaining > 0
      ? {
          item: entry.item,
          quantity: remaining
        }
      : null;
  }

  selectNext() {
    this.selectedSlot =
      (this.selectedSlot + 1) % SLOTS_IN_ROW;

    this.notify();
  }

  selectPrevious() {
    this.selectedSlot =
      (this.selectedSlot - 1 + SLOTS_IN_ROW) % SLOTS_IN_ROW;

    this.notify();
  }

  get activeSlot() {
    return this.selectedSlot;
  }

  get heldItem() {
    return this.cursorItem;
  }

  get inventorySlots() {
    return this.slots;
  }

  take(slotId: number) {
    console.trace("INVENTORY TAKE", slotId);

    if (this.cursorItem !== null)
      return;

    const slot = this.slots[slotId];

    if (!slot)
      return;

    this.slots = [...this.slots];

    this.cursorItem = {
      item: slot.item,
      quantity: slot.quantity
    };

    this.slots[slotId] = null;

    this.notify();
  }

  place(slotId: number) {
    console.trace("INVENTORY PLACE", slotId);
    
    if (!this.cursorItem)
      return;

    const cursorItem = this.cursorItem;
    const slot = this.slots[slotId];

    this.slots = [...this.slots];

    if (!slot) {
      this.slots[slotId] = cursorItem;
      this.cursorItem = null;

      this.notify();
      return;
    }

    if (slot.item === cursorItem.item) {
      const total = slot.quantity + cursorItem.quantity;

      this.slots[slotId] = {
        item: slot.item,
        quantity: Math.min(total, MAX_STACK)
      };

      if (total <= MAX_STACK) {
        this.cursorItem = null;
      } else {
        this.cursorItem = {
          item: cursorItem.item,
          quantity: total - MAX_STACK
        };
      }

      this.notify();
      return;
    }

    this.slots[slotId] = cursorItem;
    this.cursorItem = slot;

    this.notify();
  }

  takeOutside() {
    if (!this.cursorItem)
      return null;

    const item = this.cursorItem;

    this.cursorItem = null;

    this.notify();

    return item;
  }

  removeQuantity(slotId: number, quantity: number) {
    const slot = this.slots[slotId];

    if (!slot)
      throw new Error("This slot is empty");

    const newQuantity = slot.quantity - quantity;

    if (newQuantity < 0)
      throw new Error("Slot cannot have negative quantity");

    this.slots = [...this.slots];

    if (newQuantity === 0) {
      this.slots[slotId] = null;
    } else {
      this.slots[slotId] = {
        item: slot.item,
        quantity: newQuantity
      };
    }

    this.notify();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): InventorySnapshot => {
    return this.snapshot;
  };

  private notify() {
    this.snapshot = {
      slots: this.slots,
      activeSlot: this.selectedSlot,
      heldItem: this.cursorItem
    };

    for (const listener of this.listeners) {
      listener();
    }
  }
}