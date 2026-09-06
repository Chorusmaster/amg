export default class OreGenerator {
  private readonly noise: (x: number, y: number) => number;

  constructor(
    noise: (x: number, y: number) => number,
  ) {
    this.noise = noise;
  }

  getOre(x: number, y: number): string | null {
    const medium = this.noise(x * 0.06, y * 0.06);
    const small = this.noise(x * 0.12, y * 0.12);

    const value = medium * 0.4 + small * 0.6;

    if (value < -0.68) return "coal_ore";
    if (value > 0.75) return "copper_ore";

    return null;
  }
}