import Phaser from "phaser";

export class DigitalScene extends Phaser.Scene {
  constructor() {
    super({ key: "DigitalScene" });
  }

  init(data) {
    this.onComplete = data.onComplete;
  }

  create() {
    this.cameras.main.setBackgroundColor("#f3e8ff"); // light purple
    
    this.add.text(400, 50, "Digital Lab", { fontSize: "32px", color: "#6b21a8", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(400, 90, "Drag the correct block to fix the algorithm so the robot reaches the flag.", { fontSize: "16px", color: "#9333ea" }).setOrigin(0.5);

    // Robot & Path
    this.add.rectangle(400, 150, 400, 80, 0xffffff).setStrokeStyle(4, 0xd8b4fe);
    this.robot = this.add.text(250, 150, "🤖", { fontSize: "40px" }).setOrigin(0.5);
    this.flag = this.add.text(550, 150, "🚩", { fontSize: "40px" }).setOrigin(0.5);

    // The sequence (with one missing block slot)
    const seqBg = this.add.rectangle(400, 300, 500, 100, 0x000000, 0.8);
    this.add.text(200, 300, "1. MOVE", { fontSize: "20px", color: "#4ade80" }).setOrigin(0.5);
    this.add.text(320, 300, "2. MOVE", { fontSize: "20px", color: "#4ade80" }).setOrigin(0.5);
    
    // Drop Zone for the missing block
    const dropZoneBg = this.add.rectangle(460, 300, 140, 60, 0x334155).setStrokeStyle(2, 0x94a3b8, 1).setInteractive();
    this.add.text(460, 300, "Drop Block", { fontSize: "16px", color: "#94a3b8" }).setOrigin(0.5);
    const zone = this.add.zone(460, 300, 140, 60).setRectangleDropZone(140, 60);

    this.add.text(600, 300, "4. MOVE", { fontSize: "20px", color: "#4ade80" }).setOrigin(0.5);

    // Draggable Blocks
    const createBlock = (x, y, text, type) => {
      const container = this.add.container(x, y);
      const bg = this.add.rectangle(0, 0, 140, 50, 0x3b82f6).setStrokeStyle(2, 0x1d4ed8);
      const label = this.add.text(0, 0, text, { fontSize: "18px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5);
      container.add([bg, label]);
      container.setSize(140, 50);
      container.setInteractive({ draggable: true });
      container.originalX = x;
      container.originalY = y;
      container.type = type;
      return container;
    };

    createBlock(250, 450, "TURN_LEFT", "left");
    createBlock(550, 450, "TURN_RIGHT", "right"); // correct one

    this.input.on('dragstart', (pointer, gameObject) => {
      this.children.bringToTop(gameObject);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;
      gameObject.input.enabled = false;
      
      if (gameObject.type === "right") {
        // Success
        this.runAlgorithm(true);
      } else {
        // Failure
        this.runAlgorithm(false, gameObject);
      }
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });
  }

  runAlgorithm(success, gameObject) {
    if (success) {
      this.tweens.add({
        targets: this.robot,
        x: this.flag.x,
        duration: 1500,
        ease: 'Linear',
        onComplete: () => {
          this.add.text(400, 220, "🎉 Algorithm Successful!", { fontSize: "32px", color: "#16a34a", fontStyle: "bold", backgroundColor: "#ffffff", padding: {x: 20, y: 10} }).setOrigin(0.5);
          setTimeout(() => {
            if (this.onComplete) this.onComplete();
          }, 2000);
        }
      });
    } else {
      this.tweens.add({
        targets: this.robot,
        y: this.robot.y - 20,
        yoyo: true,
        repeat: 3,
        duration: 200,
        onComplete: () => {
          // Reset
          if (gameObject) {
            gameObject.x = gameObject.originalX;
            gameObject.y = gameObject.originalY;
            gameObject.input.enabled = true;
          }
        }
      });
    }
  }
}
