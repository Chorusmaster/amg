import { useEffect, useRef } from "react";
import Engine from "./engine/engine";
import SandboxGame from "./game/game";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();

      canvas.width = width;
      canvas.height = height;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    resize();

    const sandboxGame = new SandboxGame();
    const gameEngine = new Engine(canvas, sandboxGame);
    gameEngine.start();

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}