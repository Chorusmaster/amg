import Vector2 from "./vector2";

export default class Input {
  private keys = new Set<string>();

  private mouseButtons = new Set<number>();
  private mouseButtonsPressed: number[] = [];

  private mousePos = new Vector2();
  private wheelDeltaY = 0;

  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
    canvas.addEventListener("blur", this.handleBlur);

    canvas.addEventListener("pointerdown", this.handleMouseDown);
    canvas.addEventListener("pointerup", this.handleMouseUp);
    canvas.addEventListener("contextmenu", this.handleContextMenu);
    canvas.addEventListener("pointermove", this.handleMouseMove);
    canvas.addEventListener("wheel", this.handleWheelMove);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private handleBlur = () => {
    this.keys.clear();
    this.mouseButtons.clear();
    this.mouseButtonsPressed.length = 0;
    this.wheelDeltaY = 0;
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleMouseDown = (e: PointerEvent) => {
    e.preventDefault();

    if (this.mouseButtons.has(e.button))
      return;

    this.mouseButtons.add(e.button);
    this.mouseButtonsPressed.push(e.button);
  };

  private handleMouseUp = (e: PointerEvent) => {
    e.preventDefault();

    this.mouseButtons.delete(e.button);
  };

  private handleMouseMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();

    this.mousePos = new Vector2(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };

  private handleWheelMove = (e: WheelEvent) => {
    e.preventDefault();
    this.wheelDeltaY += e.deltaY;
  };

  get mousePosition() {
    return this.mousePos;
  }

  isKeyDown(code: string) {
    return this.keys.has(code);
  }

  isMouseButtonDown(button: number) {
    return this.mouseButtons.has(button);
  }

  isMouseButtonPressed(button: number) {
    const index = this.mouseButtonsPressed.indexOf(button);

    if (index === -1)
      return false;

    this.mouseButtonsPressed.splice(index, 1);
    return true;
  }

  consumeWheelDelta() {
    const delta = this.wheelDeltaY;
    this.wheelDeltaY = 0;

    return delta;
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
    this.canvas.removeEventListener("blur", this.handleBlur);

    this.canvas.removeEventListener("pointerdown", this.handleMouseDown);
    this.canvas.removeEventListener("pointerup", this.handleMouseUp);
    this.canvas.removeEventListener("contextmenu", this.handleContextMenu);
    this.canvas.removeEventListener("pointermove", this.handleMouseMove);
    this.canvas.removeEventListener("wheel", this.handleWheelMove);
  }
}