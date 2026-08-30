import Time from "./time";

export default class GameLoop {
  private running = false;

  private time: Time;
  private update: (deltaTime: number) => void;
  private render: () => void;

  constructor(
    update: (deltaTime: number) => void,
    render: () => void
  ) {
    this.time = new Time();
    this.update = update;
    this.render = render;
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    this.time.stop();
  }

  private loop = (currentTime: number) => {
    if (!this.running) return;

    this.time.update(currentTime);
    this.update(this.time.delta);
    this.render();

    requestAnimationFrame(this.loop);
  };
}