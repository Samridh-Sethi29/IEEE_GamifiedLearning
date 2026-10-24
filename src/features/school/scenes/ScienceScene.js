import Phaser from "phaser";

export class ScienceScene extends Phaser.Scene {
  constructor() {
    super({ key: "ScienceScene" });
  }

  init(data) {
    this.onComplete = data.onComplete;
  }

  create() {
    this.cameras.main.setBackgroundColor("#f0fdf4"); // light green
    
    this.add.text(400, 50, "Science Lab", { fontSize: "32px", color: "#14532d", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(400, 90, "Drag Water and Sunlight to the plant. Find the perfect balance!", { fontSize: "18px", color: "#16a34a" }).setOrigin(0.5);

    this.waterCount = 0;
    this.sunCount = 0;

    // Plant Visual
    const pot = this.add.rectangle(400, 450, 80, 80, 0x9a3412).setStrokeStyle(2, 0x431407);
    this.plant = this.add.text(400, 380, "🌱", { fontSize: "64px" }).setOrigin(0.5);
    
    // Plant drop zone
    const plantZone = this.add.zone(400, 400, 150, 200).setRectangleDropZone(150, 200);

    // Draggable Water
    const createDraggable = (x, y, emoji, type) => {
      const container = this.add.container(x, y);
      const bg = this.add.circle(0, 0, 40, 0xffffff).setStrokeStyle(2, 0x94a3b8);
      const icon = this.add.text(0, 0, emoji, { fontSize: "40px" }).setOrigin(0.5);
      container.add([bg, icon]);
      container.setSize(80, 80);
      container.setInteractive({ draggable: true });
      container.originalX = x;
      container.originalY = y;
      container.type = type;

      // When dragged and released, we spawn a new one so it acts as an infinite dispenser
      this.input.setDraggable(container);
      return container;
    };

    const waterDispenser = createDraggable(200, 300, "💧", "water");
    const sunDispenser = createDraggable(600, 300, "☀️", "sun");

    this.input.on('dragstart', (pointer, gameObject) => {
      this.children.bringToTop(gameObject);
      gameObject.setScale(1.2);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      // Applied element
      if (gameObject.type === "water") this.waterCount++;
      if (gameObject.type === "sun") this.sunCount++;
      
      // Particle effect
      const text = this.add.text(dropZone.x, dropZone.y - 50, gameObject.type === "water" ? "💦" : "✨", { fontSize: "30px" }).setOrigin(0.5);
      this.tweens.add({
        targets: text,
        y: text.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => text.destroy()
      });

      // Reset dispenser
      gameObject.x = gameObject.originalX;
      gameObject.y = gameObject.originalY;
      gameObject.setScale(1);
      
      this.updatePlant();
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        gameObject.setScale(1);
      }
    });
  }

  updatePlant() {
    if (this.waterCount === 1 && this.sunCount === 1) {
      this.plant.setText("🌻");
      this.plant.setFontSize("96px");
      this.tweens.add({ targets: this.plant, scale: 1.2, yoyo: true, duration: 300 });
      
      this.add.text(400, 200, "🎉 Perfect Balance!", { fontSize: "40px", color: "#16a34a", fontStyle: "bold", backgroundColor: "#ffffff", padding: {x: 20, y: 10} }).setOrigin(0.5);
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 2000);
    } else if (this.waterCount > 1 || this.sunCount > 1) {
      this.plant.setText("🥀");
      this.tweens.add({ targets: this.plant, angle: 15, yoyo: true, duration: 200 });
    }
  }
}
