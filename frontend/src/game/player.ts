import type Camera from "../engine/camera";
import Entity from "../engine/entity";
import type Input from "../engine/input";
import Vector2 from "../engine/vector2";
import PhysicsBody from "../engine/physics/physics-body";
import Transform from "../engine/transform";
import Collider from "../engine/physics/collider";
import type Renderer from "../engine/renderer";
import type World from "./world";
import type AssetManager from "../engine/asset-manager";
import AABB from "../engine/physics/AABB";
import { BLOCK_SIZE, SHOW_HITBOXES } from "./data/settings";
import type GameContext from "./game-context";
import Inventory from "./inventory/inventory";
import ItemStack from "./item-stack";
import type ItemRegistry from "./item-registry";
import type BlockRegistry from "./block-registry";
import Sprite from "../engine/sprite";
import SpriteSheet from "../engine/spritesheet";
import Animation from "../engine/animation";

export default class Player extends Entity {
  readonly speed = 200;
  readonly jumpForce = 400;
  readonly interactionRange = 200;

  private camera;
  private assetManager: AssetManager;
  private blockRegistry: BlockRegistry;
  private itemRegistry: ItemRegistry;
  private input: Input;

  private inventory: Inventory;

  private worldMouseCoords: Vector2 = new Vector2();
  private blockMouseCoords: Vector2 = new Vector2();

  private mainCollider: Collider;

  private animations = new Map<string, Animation>();

  constructor(
    gameContext: GameContext,
    spawnPos: Vector2,
    camera: Camera,
    world: World,
  ) {
    const playerImage = gameContext.assetManager.getImage("player");
    const playerSpritesheet = new SpriteSheet(playerImage, 64, 64);
    const playerSprite = new Sprite(
      playerSpritesheet.image,
      playerSpritesheet.getFrame(0)
    );

    const idleAnimation = new Animation(
      [playerSpritesheet.getFrame(0)],
      10
    );

    const jumpAnimation = new Animation(
      [playerSpritesheet.getFrame(4)],
      10
    );

    const walkAnimation = new Animation(
      [
        playerSpritesheet.getFrame(0),
        playerSpritesheet.getFrame(1),
        playerSpritesheet.getFrame(2),
        playerSpritesheet.getFrame(3),
      ],
      0.12
    );

    const transform = new Transform(spawnPos, new Vector2(128, 128));
    const mainCollider = new Collider(new Vector2(30, 122));

    super(
      "Player",
      playerSprite,
      transform,
      new PhysicsBody(transform, [mainCollider], true, true),
    );

    this.animations.set("idle", idleAnimation);
    this.animations.set("walk", walkAnimation);
    this.animations.set("jump", jumpAnimation);
    this.sprite!.animation = idleAnimation;

    this.mainCollider = mainCollider;
    this.assetManager = gameContext.assetManager;
    this.blockRegistry = gameContext.blockRegistry;
    this.itemRegistry = gameContext.itemRegistry;
    this.camera = camera;
    this.input = gameContext.input;
    this.world = world;
    this.inventory = gameContext.inventory;
  }

  private getAnimationOrThrow(name: string) {
    const animation = this.animations.get(name);
    if (!animation) throw new Error(`Animation ${name} doesn't exist`);
    return animation;
  }

  onTriggerEnter(other: Entity) {
    let itemsRemaining = false;

    if (other instanceof ItemStack) {
      other.items.forEach((value, key) => {
        const remaining = this.inventory.add({item: key, quantity: value});
        if (remaining) {
          itemsRemaining = true;
          other.items.set(key, remaining.quantity);
        } 
      });
    }

    if(!itemsRemaining) {
      this.world.remove(other);
    }
  }

  private isGrounded(): boolean {
    const bounds = this.mainCollider.getBounds(this.transform);

    const checkBounds = new AABB(
      new Vector2(bounds.min.x + 0.02, bounds.min.y - 1),
      new Vector2(bounds.max.x - 0.02, bounds.min.y),
    );

    return this.world.query(checkBounds).length > 0;
  }

  private selectionInteractable() {
    return (
      this.transform.position.distanceTo(this.worldMouseCoords) <=
      this.interactionRange
    );
  }

  private selectionInterferePlayer(): boolean {
    const blockBounds = this.world.getBlockBounds(this.worldMouseCoords);

    const playerBounds = this.mainCollider.getBounds(this.transform);

    return (
      playerBounds.max.x > blockBounds.min.x &&
      playerBounds.min.x < blockBounds.max.x &&
      playerBounds.max.y > blockBounds.min.y &&
      playerBounds.min.y < blockBounds.max.y
    );
  }

  private selectionContactsWithBlocks(): boolean {
    const blockCoords = this.blockMouseCoords;

    const upperBlock = this.world.getBlock(blockCoords.x, blockCoords.y + 1);
    const lowerBlock = this.world.getBlock(blockCoords.x, blockCoords.y - 1);
    const rightBlock = this.world.getBlock(blockCoords.x + 1, blockCoords.y);
    const leftBlock = this.world.getBlock(blockCoords.x - 1, blockCoords.y);

    return !!(upperBlock || lowerBlock || rightBlock || leftBlock);
  }

  private selectionInterferesBlock(): boolean {
    return !!this.world.getBlock(
      this.blockMouseCoords.x,
      this.blockMouseCoords.y,
    );
  }

  update(dt: number) {
    super.update(dt);
    let directionX = 0;

    const isGrounded = this.isGrounded();

    if (this.input.isKeyDown("KeyA")) {
      directionX -= 1;
      this.sprite!.flipX = true;
      this.sprite!.play(this.getAnimationOrThrow("walk"));
    }

    if (this.input.isKeyDown("KeyD")) {
      directionX += 1;
      this.sprite!.flipX = false;
      this.sprite!.play(this.getAnimationOrThrow("walk"));
    }

    if ((!this.input.isKeyDown("KeyA") && !this.input.isKeyDown("KeyD"))) {
      this.sprite!.play(this.getAnimationOrThrow("idle"));
    }

    this.physicsBody!.velocity.x = directionX * this.speed;

    if (this.input.isKeyDown("Space") && isGrounded) {
      this.physicsBody!.velocity.y = this.jumpForce;
    }

    if (!isGrounded) {
      this.sprite!.play(this.getAnimationOrThrow("jump"));
    }

    this.worldMouseCoords = this.camera.screenToWorld(this.input.mousePosition);
    this.blockMouseCoords = this.world.worldToBlockCoords(
      this.worldMouseCoords,
    );

    if (this.input.isMouseButtonDown(0)) {
      const held = this.inventory.heldItem;
      if (held) {
        this.inventory.takeOutside();
        const throwDirection = (this.input.mousePosition.x > this.camera.viewport.x / 2) ? 1 : -1;
        const stack = new ItemStack(
          [held], 
          this.assetManager.getImage(this.itemRegistry.getByNameOrThrow(held.item).texture),
          new Vector2(this.transform.position.x + (50 * throwDirection), this.transform.position.y + 50),
        )
        this.world.add(stack);
      } else {
        if (!this.selectionInteractable()) return;

        const { x: blockX, y: blockY } = this.world.worldToBlockCoords(
          this.worldMouseCoords,
        );
        this.world.setBlock(blockX, blockY, 0);
      }
    }

    if (this.input.isMouseButtonDown(2)) {
      if (!this.selectionInteractable()) return;
      if (!this.selectionContactsWithBlocks()) return;
      if (this.selectionInterferePlayer()) return;
      if (this.selectionInterferesBlock()) return;

      const activeSlot = this.inventory.activeSlot;
      const activeSlotData = this.inventory.inventorySlots[activeSlot];

      if (activeSlotData && activeSlotData.quantity > 0)  {
        const item = this.itemRegistry.getByNameOrThrow(activeSlotData.item);
        if (item.block) {
          const blockId = this.blockRegistry.getByNameOrThrow(item.block).id;
          this.world.setBlock(this.blockMouseCoords.x, this.blockMouseCoords.y, blockId);
          this.inventory.removeQuantity(activeSlot, 1);
        }
      }
    }

    const wheelDelta = this.input.consumeWheelDelta();
    if (wheelDelta > 0) {
      this.inventory.selectNext();
    }
    else if (wheelDelta < 0) {
      this.inventory.selectPrevious();
    }
  }

  render(renderer: Renderer, camera: Camera) {
    super.render(renderer, camera);

    const selectionVisible =
      this.selectionInteractable() &&
      (this.selectionContactsWithBlocks() || this.selectionInterferesBlock()) &&
      !this.selectionInterferePlayer();

    if (selectionVisible) {
      renderer.drawWorldImage(
        this.assetManager.getImage("selection"),
        this.camera,
        this.blockMouseCoords
          .multiply(BLOCK_SIZE)
          .add(new Vector2(BLOCK_SIZE / 2, BLOCK_SIZE / 2)),
        new Vector2(BLOCK_SIZE, BLOCK_SIZE),
      );
    }
  }
}
