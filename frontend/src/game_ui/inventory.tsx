import { useSyncExternalStore } from "react";
import GameContext from "../game/game-context";

interface Props {
  gameContext: GameContext
}

export default function Inventory({ gameContext }: Props) {
  const {
    slots,
    activeSlot,
    heldItem
  } = useSyncExternalStore(
    gameContext.inventory.subscribe,
    gameContext.inventory.getSnapshot
  );

  const { mousePos } = useSyncExternalStore(
    gameContext.input.subscribe,
    gameContext.input.getSnapshot
  );

  const handleSlotClick = (slotId: number) => {
    if (heldItem) {
      gameContext.inventory.place(slotId);
    } else {
      gameContext.inventory.take(slotId);
    }
  };

  return (
    <>
      <div className="w-full h-full pointer-events-none flex flex-col justify-end">
        <div className="w-full flex justify-center">
          <div
            id="hotbar"
            className="mb-8 pointer-events-auto flex"
          >
            {slots.map((slot, i) => (
              <button
                key={i}
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSlotClick(i);
                }}
                className="relative w-16 h-16 p-0 border-0 appearance-none"
              >
                <img
                  src={
                    i === activeSlot
                      ? "/assets/inventory_slot_selected.png"
                      : "/assets/inventory_slot.png"
                  }
                  className="absolute inset-0 w-full h-full"
                />

                {slot && (
                  <img
                    src={gameContext.assetManager.getImage(slot.item).src}
                    className="absolute inset-0 m-auto w-8 h-8"
                  />
                )}

                {slot && (
                  <span className="absolute right-1 bottom-0 text-white">
                    {slot.quantity}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {heldItem && (
        <img
          src={gameContext.assetManager.getImage(heldItem.item).src}
          className="fixed pointer-events-none w-6 h-6 z-10"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </>
  );
}