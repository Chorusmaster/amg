import { DAY_LENGTH } from "./data/settings";

export default class WorldTime {
  private time: number;
  private dayRelativeTime = 0;

  constructor(initialTime: number) {
    this.time = initialTime;
  }

  update(dt: number) {
    this.time += dt;
    this.dayRelativeTime = this.time % DAY_LENGTH;
  }

  get progress() {
    return this.dayRelativeTime / DAY_LENGTH;
  }

  get dayTime() {
    return this.dayRelativeTime;
  }

  get totalTime() {
    return this.time;
  }
}