export default class Time {
  private lastTime = 0;

  public delta = 0;
  public elapsed = 0;

  update(currentTime: number) {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }

    this.delta = (currentTime - this.lastTime) / 1000;
    this.elapsed += this.delta;
    this.lastTime = currentTime;
  }

  stop() {
    this.lastTime = 0;
    this.delta = 0;
  }

  reset() {
    this.lastTime = 0;
    this.delta = 0;
    this.elapsed = 0;
  }
}