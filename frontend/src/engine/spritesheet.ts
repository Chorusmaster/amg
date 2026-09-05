import type { SpriteFrame } from "./sprite";

export default class SpriteSheet {
    readonly image: HTMLImageElement;
    readonly frameWidth: number;
    readonly frameHeight: number;

    constructor(
        image: HTMLImageElement,
        frameWidth: number,
        frameHeight: number
    ) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }

    getFrame(index: number): SpriteFrame {
        const columns = this.image.width / this.frameWidth;

        const x = (index % columns) * this.frameWidth;
        const y = Math.floor(index / columns) * this.frameHeight;

        return {
            x,
            y,
            width: this.frameWidth,
            height: this.frameHeight
        };
    }
}