import Phaser from "phaser";

export class TeamScene extends Phaser.Scene {
  constructor() {
    super({ key: "TeamScene" });
  }

  init(data) {
    this.onComplete = data.onComplete;
  }

  create() {
    this.cameras.main.setBackgroundColor("#fefce8"); // light yellow
    
    this.add.text(400, 50, "Team Project", { fontSize: "32px", color: "#854d0e", fontStyle: "bold" }).setOrigin(0.5);
    this.add.text(400, 90, "Drag the right student to the right role based on their strengths.", { fontSize: "18px", color: "#a16207" }).setOrigin(0.5);

    this.roles = { designer: null, presenter: null };

    // Drop Zones
    const createZone = (x, y, title, roleName) => {
      const zoneBg = this.add.rectangle(x, y, 150, 150, 0xffffff).setStrokeStyle(4, 0xd4d4d8);
      this.add.text(x, y - 50, title, { fontSize: "20px", color: "#3f3f46", fontStyle: "bold" }).setOrigin(0.5);
      const zone = this.add.zone(x, y, 150, 150).setRectangleDropZone(150, 150);
      zone.roleName = roleName;
      zone.bg = zoneBg;
      return zone;
    };

    const designerZone = createZone(250, 400, "Designer", "designer");
    const presenterZone = createZone(550, 400, "Presenter", "presenter");

    // Students
    const students = [
      { id: "A", name: "Alice", strength: "Drawing", emoji: "🎨", bestRole: "designer", x: 250, y: 200 },
      { id: "B", name: "Bob", strength: "Speaking", emoji: "🗣️", bestRole: "presenter", x: 550, y: 200 }
    ];

    students.forEach(s => {
      const container = this.add.container(s.x, s.y);
      const bg = this.add.circle(0, 0, 45, 0xf8fafc).setStrokeStyle(3, 0x94a3b8);
      const icon = this.add.text(0, -10, s.emoji, { fontSize: "36px" }).setOrigin(0.5);
      const name = this.add.text(0, 25, s.name, { fontSize: "16px", color: "#0f172a", fontStyle: "bold" }).setOrigin(0.5);
      const strength = this.add.text(0, 45, `Good at: ${s.strength}`, { fontSize: "12px", color: "#475569" }).setOrigin(0.5);
      
      container.add([bg, icon, name, strength]);
      container.setSize(90, 90);
      container.setInteractive({ draggable: true });
      container.originalX = s.x;
      container.originalY = s.y;
      container.studentId = s.id;
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      this.children.bringToTop(gameObject);
      gameObject.setScale(1.1);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('drop', (pointer, gameObject, dropZone) => {
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y;
      this.roles[dropZone.roleName] = gameObject.studentId;
      
      this.tweens.add({ targets: gameObject, scale: 1, duration: 100 });
      this.checkWinCondition();
    });

    this.input.on('dragend', (pointer, gameObject, dropped) => {
      if (!dropped) {
        gameObject.x = gameObject.originalX;
        gameObject.y = gameObject.originalY;
        gameObject.setScale(1);
        
        // Remove from role if dragged out
        if (this.roles.designer === gameObject.studentId) this.roles.designer = null;
        if (this.roles.presenter === gameObject.studentId) this.roles.presenter = null;
      }
    });
  }

  checkWinCondition() {
    if (this.roles.designer === "A" && this.roles.presenter === "B") {
      this.add.text(400, 300, "🎉 Perfect Team!", { fontSize: "40px", color: "#16a34a", fontStyle: "bold", backgroundColor: "#ffffff", padding: {x: 20, y: 10} }).setOrigin(0.5);
      setTimeout(() => {
        if (this.onComplete) this.onComplete();
      }, 2000);
    }
  }
}
