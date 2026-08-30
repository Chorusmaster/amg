import Vector2 from "./vector2";

export default class Input {
  private keys = new Set<string>();
  private mouseButtons = new Set<number>();
  private mousePos = new Vector2();
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
  };

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };


  private handleMouseDown = (e: PointerEvent) => {
    e.preventDefault();
    this.mouseButtons.add(e.button);
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


  get mousePosition() {
    return this.mousePos;
  }

  isKeyDown(code: string) {
    return this.keys.has(code);
  }

  isMouseButtonDown(code: number) {
    return this.mouseButtons.has(code);
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("blur", this.handleBlur);
    window.removeEventListener("pointerdown", this.handleMouseDown);
    window.removeEventListener("pointerup", this.handleMouseUp);

    this.canvas.removeEventListener("contextmenu", this.handleContextMenu);
    this.canvas.removeEventListener("pointermove", this.handleMouseMove);
  }
}