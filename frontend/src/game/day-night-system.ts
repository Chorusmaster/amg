import type WorldTime from "./world-time";
import { MIN_SKYLIGHT, DAY_LENGTH } from "./data/settings";

export type DayNightState = {
  sunBrightness: number,
  skyColor: string,
}

export default class DayNightSystem {
  private time: WorldTime;

  constructor(time: WorldTime) {
    this.time = time
  }

  getState(): DayNightState {
    const progress = this.time.progress;

    return {
      sunBrightness: this.calculateBrightness(progress),
      skyColor: this.calculateSkyColor(progress),
    };
  }

  private calculateBrightness(progress: number) {
    const daylight = this.getDaylightFactor(progress);
    return MIN_SKYLIGHT + daylight * (1 - MIN_SKYLIGHT);
  }

  private calculateSkyColor(progress: number): string {
    type Stop = {
      time: number;
      color: [number, number, number];
    };

    const stops: Stop[] = [
      { time: 0.00, color: [100, 180, 255] }, // noon
      { time: 0.24, color: [100, 180, 255] }, // afternoon
      { time: 0.26, color: [255, 190, 130] }, // sunset starts
      { time: 0.28, color: [255, 130, 80] },  // sunset
      { time: 0.33, color: [70, 75, 130] },   // dusk
      { time: 0.50, color: [10, 15, 35] },    // midnight
      { time: 0.73, color: [70, 75, 130] },   // dawn
      { time: 0.75, color: [255, 130, 80] },  // sunrise
      { time: 0.77, color: [255, 190, 130] }, // sunrise ends
      { time: 0.82, color: [100, 180, 255] }, // morning
      { time: 1.00, color: [100, 180, 255] }, // noon
    ];

    for (let i = 0; i < stops.length - 1; i++) {
      const previousStop = stops[i];
      const nextStop = stops[i + 1];

      if (
        progress >= previousStop.time &&
        progress <= nextStop.time
      ) {
        const t = (progress - previousStop.time) / (nextStop.time - previousStop.time);
        const smoothT = t * t * (3 - 2 * t);

        return this.interpolateColor(
          previousStop.color,
          nextStop.color,
          smoothT,
        );
      }
    }

    const [r, g, b] = stops[stops.length - 1].color;
    return `rgb(${r}, ${g}, ${b})`;
  }

  private interpolateColor(
    a: [number, number, number],
    b: [number, number, number],
    t: number,
  ): string {
    const rValue = Math.round(a[0] + (b[0] - a[0]) * t);
    const gValue = Math.round(a[1] + (b[1] - a[1]) * t);
    const bValue = Math.round(a[2] + (b[2] - a[2]) * t);

    return `rgb(${rValue}, ${gValue}, ${bValue})`;
  }

  private getDaylightFactor(progress: number): number {
    // День
    if (progress < 0.24 || progress > 0.82) {
      return 1;
    }

    // Захід: 0.24 → 0.33
    if (progress < 0.33) {
      const t = (progress - 0.24) / (0.33 - 0.24);
      return 1 - t * t * (3 - 2 * t);
    }

    // Ніч: 0.33 → 0.73
    if (progress < 0.73) {
      return 0;
    }

    // Світанок: 0.73 → 0.82
    const t = (progress - 0.73) / (0.82 - 0.73);
    return t * t * (3 - 2 * t);
  }
}