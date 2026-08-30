export default class AssetManager {
  private images = new Map<string, HTMLImageElement>();

  async loadImage(key: string, src: string) {
    const image = new Image();

    image.src = src;

    await image.decode();

    this.images.set(key, image);
  }

  getImage(key: string) {
    const image = this.images.get(key);

    if (!image) {
      throw new Error(`Image "${key}" is not loaded`);
    }

    return image;
  }
}