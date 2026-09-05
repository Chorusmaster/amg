import type { SpriteFrame } from "./sprite";

export default class Animation {
    readonly frames: SpriteFrame[];
    readonly frameDuration: number;
    readonly loop: boolean;

    currentFrame = 0;
    elapsed = 0;

    constructor(
      frames: SpriteFrame[],
      frameDuration: number,
      loop = true
    ) {
      this.frames = frames;
      this.frameDuration = frameDuration;
      this.loop = loop;
    }

    update(dt: number) {
      this.elapsed += dt;

      if (this.elapsed < this.frameDuration)
        return;

      this.elapsed -= this.frameDuration;
      this.currentFrame++;

      if (this.currentFrame >= this.frames.length) {
        this.currentFrame = this.loop
          ? 0
          : this.frames.length - 1;
      }
    }

    get frame(): SpriteFrame {
      return this.frames[this.currentFrame];
    }

    reset() {
      this.currentFrame = 0;
      this.elapsed = 0;
    }
}