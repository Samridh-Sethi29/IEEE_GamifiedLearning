import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MathScene } from "../scenes/MathScene";
import { ScienceScene } from "../scenes/ScienceScene";
import { TeamScene } from "../scenes/TeamScene";
import { DigitalScene } from "../scenes/DigitalScene";

export default function PhaserMiniGame({ activity, onComplete, onCancel }) {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);

  useEffect(() => {
    if (gameInstance.current) return;

    let sceneClass;
    switch (activity) {
      case "math": sceneClass = MathScene; break;
      case "science": sceneClass = ScienceScene; break;
      case "communication": sceneClass = TeamScene; break;
      case "digital": sceneClass = DigitalScene; break;
      default: return;
    }

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameContainer.current,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: sceneClass,
      transparent: true,
    };

    gameInstance.current = new Phaser.Game(config);
    
    gameInstance.current.events.once('ready', () => {
      const scene = gameInstance.current.scene.getScene(sceneClass.name);
      if (scene) {
        scene.scene.restart({
          onComplete: () => {
            if (onComplete) onComplete();
          }
        });
      }
    });

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [activity, onComplete]);

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative border-4 border-slate-200 aspect-[4/3] mx-auto">
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-white/80 hover:bg-white text-slate-700 font-bold rounded-full shadow border border-slate-200 transition-colors backdrop-blur-sm"
        >
          ← Cancel
        </button>
      </div>
      <div ref={gameContainer} className="w-full h-full" />
    </div>
  );
}
