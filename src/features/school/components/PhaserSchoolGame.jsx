import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useQueryClient } from "@tanstack/react-query";

// Phaser Scene for the School Map
class SchoolScene extends Phaser.Scene {
  constructor() {
    super({ key: "SchoolScene" });
  }

  init(data) {
    this.onActivityTriggered = data.onActivityTriggered;
  }

  preload() {
    // No external assets required, we use shapes and emojis to keep it lightweight
  }

  create() {
    // Main Background (Grass)
    this.cameras.main.setBackgroundColor("#86efac"); 

    // Draw paths and school grounds
    const graphics = this.add.graphics();
    
    // Pathway to entrance
    graphics.fillStyle(0xd6d3d1, 1);
    graphics.fillRect(350, 480, 100, 120);
    
    // School Building Base (Shadow and Floor)
    graphics.fillStyle(0x78716c, 0.5);
    graphics.fillRoundedRect(45, 45, 710, 460, 20); // shadow
    graphics.fillStyle(0xffedd5, 1);
    graphics.fillRoundedRect(40, 40, 700, 450, 20); // main floor
    
    // Main hallway (carpet)
    graphics.fillStyle(0xfecaca, 1);
    graphics.fillRect(40, 230, 700, 80);

    // Decorative roof / entrance awning
    graphics.fillStyle(0x0ea5e9, 1);
    graphics.fillRect(330, 470, 140, 20);
    this.add.text(400, 480, "SCHOOL ENTRANCE", { fontSize: "14px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);

    this.zones = this.physics.add.staticGroup();

    // --- HELPER FUNCTION TO CREATE ROOMS ---
    const createRoom = (x, y, w, h, floorColor, borderColor, title, emoji, activity, props) => {
      // Room floor
      const room = this.add.rectangle(x, y, w, h, floorColor).setStrokeStyle(4, borderColor).setInteractive();
      
      // Title Sign
      const sign = this.add.rectangle(x, y - h/2 + 20, 120, 30, 0xffffff, 0.8).setStrokeStyle(2, borderColor);
      this.add.text(x, y - h/2 + 20, title, { fontSize: "16px", color: "#1e293b", fontStyle: "bold" }).setOrigin(0.5);
      
      // Large Emoji
      this.add.text(x, y - 10, emoji, { fontSize: "50px", alpha: 0.8 }).setOrigin(0.5);

      // Add interactivity
      this.physics.add.existing(room, true);
      room.activity = activity;
      this.zones.add(room);

      // Render custom props if any
      if (props) props(x, y, w, h);

      return room;
    };

    // 1. Math Classroom (Top Left)
    createRoom(180, 135, 260, 170, 0xbfdbfe, 0x2563eb, "Mathematics", "🧮", "math", (rx, ry) => {
      // Chalkboard
      this.add.rectangle(rx, ry - 60, 100, 40, 0x166534).setStrokeStyle(2, 0x451a03);
      this.add.text(rx, ry - 60, "2 + 2 = 4", { fontSize: "12px", color: "#ffffff" }).setOrigin(0.5);
      // Desks
      this.add.rectangle(rx - 50, ry + 30, 40, 20, 0xfcd34d);
      this.add.rectangle(rx + 50, ry + 30, 40, 20, 0xfcd34d);
    });

    // 2. Science Lab (Top Right)
    createRoom(620, 135, 260, 170, 0xbbf7d0, 0x16a34a, "Science Lab", "🔬", "science", (rx, ry) => {
      // Lab Tables
      this.add.rectangle(rx, ry + 20, 140, 30, 0xe2e8f0).setStrokeStyle(2, 0x94a3b8);
      this.add.text(rx - 30, ry + 15, "🧪", { fontSize: "20px" });
      this.add.text(rx + 30, ry + 15, "🌱", { fontSize: "20px" });
    });

    // 3. Comm/Team Room (Bottom Left)
    createRoom(180, 385, 260, 170, 0xfef08a, 0xca8a04, "Team Projects", "🤝", "communication", (rx, ry) => {
      // Round Table
      this.add.circle(rx, ry + 20, 40, 0xf97316);
      this.add.text(rx, ry + 20, "🗣️", { fontSize: "24px" }).setOrigin(0.5);
    });

    // 4. Digital Lab (Bottom Right)
    createRoom(620, 385, 260, 170, 0xe9d5ff, 0x9333ea, "Digital Lab", "💻", "digital", (rx, ry) => {
      // Computer Desks
      for(let i=0; i<3; i++) {
        this.add.rectangle(rx - 60 + (i*60), ry + 40, 40, 30, 0x334155);
        this.add.rectangle(rx - 60 + (i*60), ry + 35, 30, 20, 0x38bdf8); // screen
      }
    });

    // Handle clicks on zones
    this.input.on('gameobjectdown', (pointer, gameObject) => {
      if (gameObject.activity && this.canTrigger) {
        this.canTrigger = false;
        if (this.onActivityTriggered) {
          this.onActivityTriggered(gameObject.activity);
        }
      }
    });

    // Player Character
    this.playerGroup = this.add.container(400, 540);
    const body = this.add.rectangle(0, 0, 36, 36, 0xef4444).setStrokeStyle(3, 0x991b1b);
    const face = this.add.text(0, 0, "😎", { fontSize: "24px" }).setOrigin(0.5, 0.5);
    this.playerGroup.add([body, face]);
    
    // Setup physics on container
    this.physics.add.existing(this.playerGroup);
    this.playerGroup.body.setCollideWorldBounds(true);
    this.playerGroup.body.setSize(36, 36);

    // Cursors
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Overlaps for walking into rooms
    this.physics.add.overlap(this.playerGroup, this.zones, this.handleZoneOverlap, null, this);
    
    this.canTrigger = true;
  }

  handleZoneOverlap(player, zone) {
    if (this.canTrigger) {
      this.canTrigger = false;
      this.playerGroup.body.setVelocity(0, 0);
      
      // Push player slightly back into hallway so they don't get stuck
      player.y = 270; 

      if (this.onActivityTriggered) {
        this.onActivityTriggered(zone.activity);
      }
    }
  }

  update() {
    if (!this.canTrigger || !this.playerGroup.body) return;

    const speed = 250;
    this.playerGroup.body.setVelocity(0);

    let isMoving = false;
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.playerGroup.body.setVelocityX(-speed);
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.playerGroup.body.setVelocityX(speed);
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.playerGroup.body.setVelocityY(-speed);
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.playerGroup.body.setVelocityY(speed);
      isMoving = true;
    }
    
    // Simple bobbing animation when moving
    if (isMoving) {
      this.playerGroup.scaleY = 0.95 + Math.sin(this.time.now / 50) * 0.05;
    } else {
      this.playerGroup.scaleY = 1;
    }
  }
}


export default function PhaserSchoolGame({ onLaunchActivity }) {
  const gameContainer = useRef(null);
  const gameInstance = useRef(null);

  useEffect(() => {
    if (gameInstance.current) return; // Prevent multiple instances

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
      scene: SchoolScene,
      transparent: true,
    };

    gameInstance.current = new Phaser.Game(config);
    
    gameInstance.current.events.once('ready', () => {
      const scene = gameInstance.current.scene.getScene("SchoolScene");
      if (scene) {
        scene.scene.restart({
          onActivityTriggered: (activity) => {
            onLaunchActivity(activity);
            
            // Allow triggering again after 2 seconds or when activity is closed
            setTimeout(() => {
              if (scene && scene.scene.isActive()) {
                scene.canTrigger = true;
              }
            }, 2000);
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
  }, [onLaunchActivity]);

  return (
    <div 
      ref={gameContainer} 
      className="w-full h-full shadow-2xl mx-auto" 
      style={{ background: "#a7f3d0" }}
    />
  );
}
