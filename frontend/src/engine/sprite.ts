export type SpriteFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export default class Sprite {
  readonly image: HTMLImageElement;
  frame?: SpriteFrame;

  constructor(image: HTMLImageElement, frame?: SpriteFrame) {
    this.image = image;
    this.frame = frame;
  }
}