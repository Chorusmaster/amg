import { useEffect, useRef, useState } from "react";
import Engine from "./engine/engine";
import SandboxGame from "./game/game";
import Inventory from "./game_ui/inventory";
import GameContext from "./game/game-context";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<SandboxGame | null>(null);

  useEffect(() => {
    const awaitGameStart = async () => {
      await gameEngine.start();
      setGame(sandboxGame);
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const sandboxGame = new SandboxGame();
    const gameEngine = new Engine(canvas, sandboxGame);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();

      canvas.width = width;
      canvas.height = height;

      gameEngine.resize(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    resize();
    awaitGameStart();

    return () => {
      observer.disconnect();
      gameEngine.stop();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
      />
      {
        game?.gameContext?.inventory &&
        <div id="gameUi" className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <Inventory gameContext={game.gameContext} />
        </div>
      }
    </div>
  );
}