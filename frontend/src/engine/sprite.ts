import Animation from "./animation";

export type SpriteFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default class Sprite {
  readonly image: HTMLImageElement;
  frame?: SpriteFrame;
  animation?: Animation;

  flipX: boolean;
  flipY: boolean;

  constructor(
    image: HTMLImageElement,
    frame?: SpriteFrame,
    flipX = false,
    flipY = false
  ) {
    this.image = image;
    this.flipX = flipX;
    this.flipY = flipY;
    this.frame = frame;
  }

  play(animation: Animation) {
    if (this.animation === animation)
      return;

    this.animation = animation;
    this.animation.reset();
  }

  update(dt: number) {
    this.animation?.update(dt);

    if (this.animation) {
      this.frame = this.animation.frame;
    }
  }
}