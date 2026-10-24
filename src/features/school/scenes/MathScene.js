import Phaser from "phaser";

export class MathScene extends Phaser.Scene {
  constructor() {
    super({ key: "MathScene" });
  }

  init(data) {
    this.onComplete = data.onComplete;
  }

  create() {
    this.cameras.main.setBackgroundColor("#eff6ff"); // light blue
    
    this.add.text(400, 50, "Math Market", { fontSize: "32px", color: "#1e3a8a", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(400, 90, "Drag 3 items into the basket without spending over 30 coins!", { fontSize: "18px", color: "#3b82f6" }).setOrigin(0.5);
    
    // Budget & Stats
    this.budget = 30;
    this.spent = 0;
    this.itemsInBasket = 0;
    
    this.budgetText = this.add.text(50, 150, `Coins: ${this.budget}`, { fontSize: "24px", color: "#16a34a", fontStyle: "bold" });
    
    // Items on shelf
    const items = [
      { name: "Notebook", cost: 10, emoji: "📓", x: 200, y: 250 },
      { name: "Pencil", cost: 5, emoji: "✏️", x: 350, y: 250 },
      { name: "Eraser", cost: 3, emoji: "🧼", x: 500, y: 250 },
      { name: "Bottle", cost: 15, emoji: "💧", x: 650, y: 250 }
    ];

    // Shelf visual
    this.add.rectangle(425, 290, 600, 20, 0x854d0e);

    // Basket drop zone
    const basket = this.add.rectangle(400, 450, 200, 100, 0xfef08a).setStrokeStyle(4, 0xca8a04);
    this.add.text(400, 450, "🛒 Drop Here", { fontSize: "24px", color: "#ca8a04" }).setOrigin(0.5);
    const basketZone = this.add.zone(400, 450, 200, 100).setRectangleDropZone(200, 100);

    items.forEach(item => {
      const container = this.add.container(item.x, item.y);
      const bg = this.add.circle(0, 0, 35, 0xffffff).setStrokeStyle(2, 0x94a3b8);
      const icon = this.add.text(0, 0, item.emoji, { fontSize: "32px" }).setOrigin(0.5);
      const label = this.add.text(0, 45, `${item.cost}c`, { fontSize: "16px", color: "#334155", fontStyle: "bold", backgroundColor: "#f8fafc", padding: {x:4, y:2} }).setOrigin(0.5);
      
      container.add([bg, icon, label]);
      container.setSize(70, 70);
      container.setInteractive({ draggable: true });
      
      // Store original position to snap back if not dropped in basket
      container.originalX = item.x;
      container.originalY = item.y;
      container.cost = item.cost;
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      this.children.bringToTop(gameObject);
      gameObject.setScale(1.1);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragenter', (pointer, gameObject, dropZone) => {
      basket.setFillStyle(0xfde047); // highlight
    });

    this.input.on('dragleave', (pointer, gameObject, dropZone) => {
      basket.setFillStyle(0xfef08a);
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      if (this.spent + gameObject.cost <= this.budget) {
        // Drop success
        gameObject.x = dropZone.x - 50 + (this.itemsInBasket * 50);
        gameObject.y = dropZone.y;
        gameObject.input.enabled = false; // disable dragging once bought
        basket.setFillStyle(0xfef08a);
        
        this.spent += gameObject.cost;
        this.itemsInBasket += 1;
        this.budgetText.setText(`Coins: ${this.budget - this.spent}`);
        
        // Bounce animation
        this.tweens.add({
          targets: gameObject,
          y: gameObject.y - 10,
          yoyo: true,
          duration: 100
        });

        this.checkWinCondition();
      } else {
        // Can't afford
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        basket.setFillStyle(0xfef08a);
        
        // Shake budget text
        this.tweens.add({
          targets: this.budgetText,
          x: this.budgetText.x + 5,
          yoyo: true,
          repeat: 3,
          duration: 50
        });
      }
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      gameObject.setScale(1);
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
      }
    });
  }

  checkWinCondition() {
    if (this.itemsInBasket >= 3) {
      this.add.text(400, 350, "🎉 Great Budgeting!", { fontSize: "40px", color: "#16a34a", fontStyle: "bold", backgroundColor: "#ffffff", padding: {x: 20, y: 10} }).setOrigin(0.5);
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 2000);
    }
  }
}
