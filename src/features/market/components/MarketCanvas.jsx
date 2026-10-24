import React, { useRef, useEffect, useCallback } from "react";
import { PRODUCTS } from "../utils/constants";

// Logical 16:9 coordinate system
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 576;

// World interactive objects
export const WORLD_OBJECTS = {
  shelfDrinks: { x: 245, y: 110, w: 175, h: 180, type: "shelf", shelfKey: "drinks", name: "Drinks Shelf" },
  shelfSnacks: { x: 440, y: 110, w: 175, h: 180, type: "shelf", shelfKey: "snacks", name: "Snacks Shelf" },
  shelfFood:   { x: 635, y: 110, w: 175, h: 180, type: "shelf", shelfKey: "food",   name: "Food Shelf" },
  storage:     { x: 860, y: 155, w: 140, h: 195, type: "storage", name: "Storage Room" },
  checkout:    { x: 608, y: 410, w: 310, h: 95,  type: "checkout", name: "Checkout Counter" }
};

// Collision obstacles for player movement
export const OBSTACLES = [
  // Top wall boundary
  { x: 0, y: 0, w: 1024, h: 150 },
  // Bottom boundary
  { x: 0, y: 550, w: 1024, h: 26 },
  // Left entrance boundary
  { x: 0, y: 0, w: 190, h: 576 },
  // Right boundary
  { x: 995, y: 0, w: 30, h: 576 },
  // Entrance queue divider fence
  { x: 165, y: 140, w: 25, h: 320 },
  // Shelves solid bodies
  { x: 245, y: 120, w: 175, h: 160 },
  { x: 440, y: 120, w: 175, h: 160 },
  { x: 635, y: 120, w: 175, h: 160 },
  // Storage cabinet
  { x: 860, y: 155, w: 140, h: 190 },
  // Checkout counter table
  { x: 608, y: 410, w: 310, h: 90 }
];

export default function MarketCanvas({
  layout,
  playerPos,
  playerFacing,
  playerMoving,
  playerFrame,
  carryingItem,
  inventory,
  customers = [],
  activeCustomer,
  nearbyInteractable,
  onInteract,
  onOpenShelfModal
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const container = containerRef.current;
    const width = container ? container.clientWidth : (layout?.canvasWidth || CANVAS_WIDTH);
    const height = container ? container.clientHeight : (layout?.canvasHeight || CANVAS_HEIGHT);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // Uniform scale preserving vertical height of 576
    const baseHeight = layout?.canvasHeight || CANVAS_HEIGHT;
    const scale = height / baseHeight;
    const canvasWidth = width / scale;
    const canvasHeight = baseHeight;

    ctx.scale(scale, scale);

    const storageX = layout?.storageX ?? (canvasWidth - 164);
    const checkoutX = layout?.checkoutX ?? (canvasWidth - 416);
    const shelfDrinksX = layout?.shelfDrinksX ?? 220;
    const shelfSnacksX = layout?.shelfSnacksX ?? 437;
    const shelfFoodX = layout?.shelfFoodX ?? 654;

    // 1. Draw Wooden Floor Planks extending across full width
    drawFloor(ctx, canvasWidth, canvasHeight);

    // 2. Draw Back Wall, Arched Windows & Hanging Lanterns across full width
    drawBackWall(ctx, canvasWidth, shelfDrinksX, shelfSnacksX, shelfFoodX, storageX);

    // 3. Draw Store Entrance, Striped Awning, Queue Runner & Chalkboard
    drawEntrance(ctx, customers);

    // 4. Draw 3 Product Shelves (Drinks, Snacks, Food) with live stock
    drawShelves(ctx, inventory, shelfDrinksX, shelfSnacksX, shelfFoodX, storageX);

    // 5. Draw Storage Cabinet & Guidance Bubble
    drawStorageCabinet(ctx, inventory, storageX);

    // 6. Draw Customers Behind Counter (y <= 410)
    drawCustomers(ctx, customers, (c) => (c.y || 0) <= 410);

    // 7. Draw Checkout Counter with Table, Bag, POS & Scanner
    drawCheckoutCounter(ctx, activeCustomer, checkoutX);

    // 8. Draw Customers In Front Of Counter (y > 410, if any)
    drawCustomers(ctx, customers, (c) => (c.y || 0) > 410);

    // 9. Draw Vendor Player Character with Direction Arrows
    drawVendor(ctx, playerPos, playerFacing, playerMoving, playerFrame, carryingItem);

    // 10. Draw Contextual Interaction Prompt
    if (nearbyInteractable) {
      drawInteractionPrompt(ctx, nearbyInteractable);
    }
  }, [layout, playerPos, playerFacing, playerMoving, playerFrame, carryingItem, inventory, customers, activeCustomer, nearbyInteractable]);

  useEffect(() => {
    let animId;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const baseHeight = layout?.canvasHeight || CANVAS_HEIGHT;
    const scale = rect.height / baseHeight;

    const canvasX = clickX / scale;
    const canvasY = clickY / scale;

    const canvasWidth = rect.width / scale;
    const storageX = layout?.storageX ?? (canvasWidth - 164);
    const checkoutX = layout?.checkoutX ?? (canvasWidth - 416);
    const shelfDrinksX = layout?.shelfDrinksX ?? 220;
    const shelfSnacksX = layout?.shelfSnacksX ?? 437;
    const shelfFoodX = layout?.shelfFoodX ?? 654;

    const clickableObjects = [
      { type: "checkout", x: checkoutX, y: 410, w: 310, h: 95 },
      { type: "storage", x: storageX, y: 155, w: 140, h: 195 },
      { type: "shelf", shelfKey: "drinks", x: shelfDrinksX, y: 110, w: 175, h: 180 },
      { type: "shelf", shelfKey: "snacks", x: shelfSnacksX, y: 110, w: 175, h: 180 },
      { type: "shelf", shelfKey: "food", x: shelfFoodX, y: 110, w: 175, h: 180 }
    ];

    for (const obj of clickableObjects) {
      if (
        canvasX >= obj.x &&
        canvasX <= obj.x + obj.w &&
        canvasY >= obj.y &&
        canvasY <= obj.y + obj.h
      ) {
        if (obj.type === "shelf" && onOpenShelfModal) {
          onOpenShelfModal(obj.shelfKey);
          return;
        } else if (onInteract) {
          onInteract(obj.type, obj.shelfKey);
          return;
        }
      }
    }

    // Fallback: If nearby interactable exists, trigger interaction
    if (nearbyInteractable && onInteract) {
      if (nearbyInteractable.type === "shelf" && onOpenShelfModal) {
        onOpenShelfModal(nearbyInteractable.shelfKey);
      } else {
        onInteract(nearbyInteractable.type, nearbyInteractable.shelfKey);
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#fae5b6] select-none"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block"
        }}
        onClick={handleCanvasClick}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 1. FLOOR (Warm honey-colored horizontal wooden planks)
// -------------------------------------------------------------
function drawFloor(ctx, canvasWidth = CANVAS_WIDTH, canvasHeight = CANVAS_HEIGHT) {
  const startY = 120;
  ctx.fillStyle = "#fae5b6";
  ctx.fillRect(0, startY, canvasWidth, canvasHeight - startY);

  const plankH = 26;
  const plankW = 120;

  for (let y = startY, r = 0; y < canvasHeight; y += plankH, r++) {
    const shift = (r % 2) * 55;
    for (let x = -60 + shift; x < canvasWidth + 60; x += plankW) {
      ctx.fillStyle = (r + Math.floor(x / plankW)) % 2 === 0 ? "#f9e0a8" : "#f4d496";
      ctx.fillRect(x, y, plankW, plankH);

      // Wood grain lines
      ctx.strokeStyle = "rgba(180, 115, 45, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + plankH / 2);
      ctx.lineTo(x + plankW - 4, y + plankH / 2);
      ctx.stroke();

      // Vertical plank seam
      ctx.beginPath();
      ctx.moveTo(x + plankW, y);
      ctx.lineTo(x + plankW, y + plankH);
      ctx.stroke();
    }

    // Horizontal seam line
    ctx.strokeStyle = "rgba(165, 100, 35, 0.22)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}

// -------------------------------------------------------------
// 2. BACK WALL WITH ARCHED WINDOWS & LANTERNS
// -------------------------------------------------------------
function drawBackWall(ctx, canvasWidth = CANVAS_WIDTH, shelfDrinksX = 245, shelfSnacksX = 440, shelfFoodX = 635, storageX = 860) {
  // Wall base color (soft warm cream)
  ctx.fillStyle = "#fbf1dc";
  ctx.fillRect(0, 0, canvasWidth, 125);

  // Bottom wooden trim molding
  ctx.fillStyle = "#c87d3a";
  ctx.fillRect(0, 118, canvasWidth, 7);
  ctx.fillStyle = "#9a561c";
  ctx.fillRect(0, 123, canvasWidth, 2);

  // Arched Windows behind each of the 3 centered shelves
  const windowCenters = [
    shelfDrinksX + 87,
    shelfSnacksX + 87,
    shelfFoodX + 87
  ];

  windowCenters.forEach((wx) => {
    // Window Frame
    ctx.fillStyle = "#b46d30";
    ctx.beginPath();
    ctx.arc(wx, 55, 38, Math.PI, 0);
    ctx.rect(wx - 38, 55, 76, 45);
    ctx.fill();

    // Window Glass: Sky & Sunshine
    ctx.fillStyle = "#bae6fd";
    ctx.beginPath();
    ctx.arc(wx, 55, 32, Math.PI, 0);
    ctx.rect(wx - 32, 55, 64, 40);
    ctx.fill();

    // Green tree hills outside window
    ctx.fillStyle = "#86efac";
    ctx.beginPath();
    ctx.arc(wx - 10, 85, 22, 0, Math.PI * 2);
    ctx.arc(wx + 15, 88, 20, 0, Math.PI * 2);
    ctx.fill();

    // Window muntin bars
    ctx.strokeStyle = "#8d4e16";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(wx, 23);
    ctx.lineTo(wx, 95);
    ctx.moveTo(wx - 32, 58);
    ctx.lineTo(wx + 32, 58);
    ctx.stroke();
  });

  // Hanging Industrial Warm Lanterns (balanced across both sides and aisle gaps)
  const leftSpaceX = Math.round((195 + shelfDrinksX) / 2);
  const rightSpaceX = Math.round((shelfFoodX + 175 + storageX) / 2);

  const lanternPoints = [
    leftSpaceX,
    Math.round((shelfDrinksX + 175 + shelfSnacksX) / 2),
    Math.round((shelfSnacksX + 175 + shelfFoodX) / 2),
    rightSpaceX,
    storageX + 70
  ];
  lanternPoints.forEach((lx) => {
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 42);
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(lx, 36);
    ctx.lineTo(lx - 10, 44);
    ctx.lineTo(lx + 10, 44);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(lx, 49, 7, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(lx, 50, 6, lx, 110, 80);
    grad.addColorStop(0, "rgba(254, 240, 138, 0.28)");
    grad.addColorStop(0.5, "rgba(254, 240, 138, 0.08)");
    grad.addColorStop(1, "rgba(254, 240, 138, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lx, 85, 75, 0, Math.PI * 2);
    ctx.fill();
  });

  // Framed Pictures on the equal left and right wall spaces
  drawFramedPicture(ctx, leftSpaceX - 14, 52, 28, 36, "leaf");
  drawFramedPicture(ctx, rightSpaceX - 15, 48, 30, 38, "cart");
}

function drawFramedPicture(ctx, x, y, w, h, type) {
  ctx.fillStyle = "#b46d30";
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

  if (type === "cart") {
    // Shopping cart silhouette
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.lineTo(x + 16, y + 24);
    ctx.lineTo(x + 24, y + 24);
    ctx.lineTo(x + 26, y + 15);
    ctx.lineTo(x + 13, y + 15);
    ctx.stroke();
    // Wheels
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(x + 17, y + 26, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 23, y + 26, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Green leaf
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, 5, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// -------------------------------------------------------------
// 3. STORE ENTRANCE & EXIT LANES (Side-by-side Entry & Exit)
// -------------------------------------------------------------
function drawEntrance(ctx, customers) {
  // Striped Canopy Awning over Entrance & Exit (spans across both lanes)
  const ax = 18;
  const ay = 68;
  const aw = 168;
  const ah = 44;

  const stripeW = 14;
  for (let x = ax, i = 0; x < ax + aw; x += stripeW, i++) {
    ctx.fillStyle = i % 2 === 0 ? "#fb7185" : "#ffffff";
    ctx.fillRect(x, ay, stripeW, ah);

    // Scalloped bottom fringe
    ctx.beginPath();
    ctx.arc(x + stripeW / 2, ay + ah, stripeW / 2, 0, Math.PI);
    ctx.fill();
  }

  // Wooden Plaques side-by-side: "ENTRY" on Left, "EXIT" on Right
  const py = ay + ah + 4;
  const ph = 26;

  // 1. ENTRY Plaque (Left)
  const px1 = 20;
  const pw1 = 76;
  ctx.fillStyle = "#633109";
  ctx.beginPath();
  roundRect(ctx, px1, py, pw1, ph, 5);
  ctx.fill();
  ctx.strokeStyle = "#16a34a"; // Green accent
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ENTRY ↓", px1 + pw1 / 2, py + 18);

  // 2. EXIT Plaque (Right - beside Entry)
  const px2 = 104;
  const pw2 = 76;
  ctx.fillStyle = "#633109";
  ctx.beginPath();
  roundRect(ctx, px2, py, pw2, ph, 5);
  ctx.fill();
  ctx.strokeStyle = "#e11d48"; // Rose accent
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("EXIT ↑", px2 + pw2 / 2, py + 18);

  // Street Lantern on Left Post
  const lx = 8;
  const ly = 120;
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(lx, ly, 8, 35);
  ctx.beginPath();
  roundRect(ctx, lx - 7, ly + 6, 22, 22, 4);
  ctx.fill();
  ctx.fillStyle = "#fef08a";
  ctx.fillRect(lx - 4, ly + 9, 16, 16);

  // --- TWO RUNNER CARPETS SIDE-BY-SIDE ---
  const ry = 145;
  const rh = 345;
  const laneW = 68;

  // LANE 1 (LEFT): ENTRY RUNNER (Red/Pink with downward arrows ▼)
  const rx1 = 26;
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  roundRect(ctx, rx1, ry, laneW, rh, 8);
  ctx.fill();
  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  roundRect(ctx, rx1 + 3, ry + 3, laneW - 6, rh - 6, 6);
  ctx.fill();

  // White downward arrows (▼ ▼ ▼) along ENTRY lane
  ctx.fillStyle = "#ffffff";
  for (let y = ry + 40; y < ry + rh - 20; y += 65) {
    ctx.beginPath();
    ctx.moveTo(rx1 + laneW / 2, y + 8);
    ctx.lineTo(rx1 + laneW / 2 + 7, y - 6);
    ctx.lineTo(rx1 + laneW / 2 - 7, y - 6);
    ctx.closePath();
    ctx.fill();
  }

  // LANE 2 (RIGHT): EXIT RUNNER (Teal/Emerald with upward arrows ▲)
  const rx2 = 104;
  ctx.fillStyle = "#0d9488";
  ctx.beginPath();
  roundRect(ctx, rx2, ry, laneW, rh, 8);
  ctx.fill();
  ctx.fillStyle = "#14b8a6";
  ctx.beginPath();
  roundRect(ctx, rx2 + 3, ry + 3, laneW - 6, rh - 6, 6);
  ctx.fill();

  // White upward arrows (▲ ▲ ▲) along EXIT lane
  ctx.fillStyle = "#ffffff";
  for (let y = ry + 40; y < ry + rh - 20; y += 65) {
    ctx.beginPath();
    ctx.moveTo(rx2 + laneW / 2, y - 8);
    ctx.lineTo(rx2 + laneW / 2 + 7, y + 6);
    ctx.lineTo(rx2 + laneW / 2 - 7, y + 6);
    ctx.closePath();
    ctx.fill();
  }

  // Wooden Handrail / Partition dividing lanes from the store
  const hx = rx2 + laneW + 8;
  ctx.fillStyle = "#b46d30";
  ctx.fillRect(hx, 140, 7, 310);
  // Vertical posts
  for (let py = 140; py <= 440; py += 65) {
    ctx.fillStyle = "#78350f";
    ctx.fillRect(hx - 4, py, 15, 12);
  }

  // Potted plants along the partition posts
  drawPottedPlant(ctx, hx + 12, 175, 0.85);
  drawPottedPlant(ctx, hx + 12, 310, 0.85);

  // Potted plant on floor beside chalkboard sign
  drawPottedPlant(ctx, 22, 485, 0.95);

  // Chalkboard Sign: "Welcome to Skillz Market! ❤️" (Bottom left)
  const cx = 4;
  const cy = 350;
  const cw = 64;
  const ch = 96;

  ctx.fillStyle = "#8d4e16";
  ctx.beginPath();
  roundRect(ctx, cx, cy, cw, ch, 6);
  ctx.fill();

  ctx.fillStyle = "#264e36";
  ctx.beginPath();
  roundRect(ctx, cx + 4, cy + 4, cw - 8, ch - 8, 4);
  ctx.fill();

  // Chalk text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Welcome to", cx + cw / 2, cy + 22);
  ctx.fillText("Skillz", cx + cw / 2, cy + 36);
  ctx.fillText("Market!", cx + cw / 2, cy + 50);

  // Red chalk heart
  ctx.fillStyle = "#f43f5e";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("❤️", cx + cw / 2, cy + 74);
}

// -------------------------------------------------------------
// 4. 3 PRODUCT SHELVES (DRINKS, SNACKS, FOOD)
// -------------------------------------------------------------
function drawShelves(ctx, inventory, shelfDrinksX = 220, shelfSnacksX = 437, shelfFoodX = 654, storageX = 860) {
  const shelfList = [
    { key: "drinks", title: "Drinks", icon: "🥛", x: shelfDrinksX, y: 110, w: 175, h: 180 },
    { key: "snacks", title: "Snacks", icon: "🍪", x: shelfSnacksX, y: 110, w: 175, h: 180 },
    { key: "food",   title: "Food",   icon: "🍎", x: shelfFoodX,   y: 110, w: 175, h: 180 }
  ];

  shelfList.forEach((s) => {
    // Shadow under shelf
    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.fillRect(s.x + 8, s.y + s.h, s.w - 16, 12);

    // Shelf Wooden Frame
    ctx.fillStyle = "#9a561c";
    ctx.beginPath();
    roundRect(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();

    // Inner backboard
    ctx.fillStyle = "#faebd0";
    ctx.fillRect(s.x + 8, s.y + 30, s.w - 16, s.h - 38);

    // Shelf Tier Planks
    ctx.fillStyle = "#b46d30";
    ctx.fillRect(s.x + 6, s.y + 95, s.w - 12, 9);
    ctx.fillRect(s.x + 6, s.y + 168, s.w - 12, 9);

    // Header Plaque
    ctx.fillStyle = "#633109";
    ctx.beginPath();
    roundRect(ctx, s.x + 22, s.y + 5, s.w - 44, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${s.icon} ${s.title}`, s.x + s.w / 2, s.y + 21);

    // Decorative Green Vines on Top Shelf Corners
    drawVines(ctx, s.x - 3, s.y + 5);
    drawVines(ctx, s.x + s.w - 10, s.y + 5);

    // Products on shelves
    if (s.key === "drinks") {
      // Top row: 3 Water Bottles + 3 Orange Juice Bottles
      const waterQty = inventory?.water?.shelf ?? PRODUCTS.water.initialShelf;
      const juiceQty = inventory?.juice?.shelf ?? PRODUCTS.juice.initialShelf;
      if (waterQty > 0) {
        drawWaterBottle(ctx, s.x + 18, s.y + 44);
        drawWaterBottle(ctx, s.x + 40, s.y + 44);
        drawWaterBottle(ctx, s.x + 62, s.y + 44);
      } else {
        drawEmptyTag(ctx, s.x + 40, s.y + 60);
      }
      if (juiceQty > 0) {
        drawJuiceBottle(ctx, s.x + 94, s.y + 44);
        drawJuiceBottle(ctx, s.x + 118, s.y + 44);
        drawJuiceBottle(ctx, s.x + 142, s.y + 44);
      } else {
        drawEmptyTag(ctx, s.x + 118, s.y + 60);
      }

      // Bottom row: 3 Milk Cartons + 3 Red Cola Cans
      const milkQty = inventory?.milk?.shelf ?? PRODUCTS.milk.initialShelf;
      const sodaQty = inventory?.soda?.shelf ?? PRODUCTS.soda.initialShelf;
      if (milkQty > 0) {
        drawMilkCarton(ctx, s.x + 18, s.y + 115);
        drawMilkCarton(ctx, s.x + 42, s.y + 115);
        drawMilkCarton(ctx, s.x + 66, s.y + 115);
      } else {
        drawEmptyTag(ctx, s.x + 42, s.y + 135);
      }
      if (sodaQty > 0) {
        drawSodaCan(ctx, s.x + 96, s.y + 120);
        drawSodaCan(ctx, s.x + 120, s.y + 120);
        drawSodaCan(ctx, s.x + 144, s.y + 120);
      } else {
        drawEmptyTag(ctx, s.x + 120, s.y + 135);
      }
    } else if (s.key === "snacks") {
      // Top row: Red Chips, Blue Chips, Green Chips
      const chipsQty = inventory?.chips?.shelf ?? PRODUCTS.chips.initialShelf;
      if (chipsQty > 0) {
        drawChipsPacket(ctx, s.x + 18, s.y + 40, "#ef4444"); // Red
        drawChipsPacket(ctx, s.x + 64, s.y + 40, "#3b82f6"); // Blue
        drawChipsPacket(ctx, s.x + 110, s.y + 40, "#22c55e"); // Green
      } else {
        drawEmptyTag(ctx, s.x + 85, s.y + 60);
      }

      // Bottom row: Brown Cookies, Purple Cookies, Orange Nuts
      const cookiesQty = inventory?.cookies?.shelf ?? PRODUCTS.cookies.initialShelf;
      const nutsQty = inventory?.nuts?.shelf ?? PRODUCTS.nuts.initialShelf;
      if (cookiesQty > 0) {
        drawSnackBox(ctx, s.x + 16, s.y + 120, "#78350f", "COOKIES");
        drawSnackBox(ctx, s.x + 68, s.y + 120, "#9333ea", "COOKIES");
      }
      if (nutsQty > 0) {
        drawSnackBox(ctx, s.x + 118, s.y + 120, "#ea580c", "NUTS");
      }
    } else if (s.key === "food") {
      // Top row: Apples, Bananas, Oranges
      const applesQty = inventory?.apples?.shelf ?? PRODUCTS.apples.initialShelf;
      const bananasQty = inventory?.bananas?.shelf ?? PRODUCTS.bananas.initialShelf;
      const orangesQty = inventory?.oranges?.shelf ?? PRODUCTS.oranges.initialShelf;

      if (applesQty > 0) {
        drawFruitPile(ctx, s.x + 30, s.y + 62, "#ef4444"); // Apples
      }
      if (bananasQty > 0) {
        drawBananas(ctx, s.x + 85, s.y + 55);
      }
      if (orangesQty > 0) {
        drawFruitPile(ctx, s.x + 140, s.y + 62, "#f97316"); // Oranges
      }

      // Bottom row: Bread, Eggs, Cheese
      const breadQty = inventory?.bread?.shelf ?? PRODUCTS.bread.initialShelf;
      const eggsQty = inventory?.eggs?.shelf ?? PRODUCTS.eggs.initialShelf;
      const cheeseQty = inventory?.cheese?.shelf ?? PRODUCTS.cheese.initialShelf;

      if (breadQty > 0) {
        drawBreadLoaf(ctx, s.x + 18, s.y + 128);
      }
      if (eggsQty > 0) {
        drawEggCarton(ctx, s.x + 72, s.y + 130);
      }
      if (cheeseQty > 0) {
        drawCheeseWedge(ctx, s.x + 126, s.y + 128);
      }
    }
  });

  // Exactly ONE potted plant centered between Drinks and Snacks
  const plant1X = Math.round((shelfDrinksX + 175 + shelfSnacksX) / 2);
  drawPottedPlant(ctx, plant1X, 238, 1.05);

  // Exactly ONE potted plant centered between Snacks and Food
  const plant2X = Math.round((shelfSnacksX + 175 + shelfFoodX) / 2);
  drawPottedPlant(ctx, plant2X, 238, 1.05);
}

function drawVines(ctx, x, y) {
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.arc(x, y + 4, 4, 0, Math.PI * 2);
  ctx.arc(x + 2, y + 10, 3.5, 0, Math.PI * 2);
  ctx.arc(x + 1, y + 15, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawEmptyTag(ctx, x, y) {
  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OUT OF STOCK", x, y);
}

function drawWaterBottle(ctx, x, y) {
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  roundRect(ctx, x, y + 6, 16, 36, 4);
  ctx.fill();
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(x + 4, y, 8, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 18, 12, 12);
}

function drawJuiceBottle(ctx, x, y) {
  ctx.fillStyle = "#fb923c";
  ctx.beginPath();
  roundRect(ctx, x, y + 6, 16, 36, 4);
  ctx.fill();
  ctx.fillStyle = "#c2410c";
  ctx.fillRect(x + 4, y, 8, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 18, 12, 12);
}

function drawMilkCarton(ctx, x, y) {
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(x, y + 8, 18, 38);
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x + 9, y);
  ctx.lineTo(x + 18, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 16, 14, 18);
  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MILK", x + 9, y + 27);
}

function drawSodaCan(ctx, x, y) {
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  roundRect(ctx, x, y, 16, 34, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 17, 5, 8, 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawChipsPacket(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  roundRect(ctx, x, y, 36, 44, 4);
  ctx.fill();
  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.ellipse(x + 18, y + 22, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CHIPS", x + 18, y + 12);
}

function drawSnackBox(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.beginPath();
  roundRect(ctx, x, y, 42, 38, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 6px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, x + 21, y + 14);
  // Biscuit / nut circles
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(x + 14, y + 26, 5, 0, Math.PI * 2);
  ctx.arc(x + 28, y + 26, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawFruitPile(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x - 8, y + 4, 8, 0, Math.PI * 2);
  ctx.arc(x + 8, y + 4, 8, 0, Math.PI * 2);
  ctx.arc(x, y - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#15803d";
  ctx.fillRect(x - 1, y - 14, 2, 4);
}

function drawBananas(ctx, x, y) {
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.ellipse(x, y + 8, 18, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#713f12";
  ctx.fillRect(x - 18, y + 3, 4, 5);
}

function drawBreadLoaf(ctx, x, y) {
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  roundRect(ctx, x, y + 6, 42, 22, 6);
  ctx.fill();
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.ellipse(x + 21, y + 10, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEggCarton(ctx, x, y) {
  ctx.fillStyle = "#d1d5db";
  ctx.beginPath();
  roundRect(ctx, x, y + 6, 42, 20, 4);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 10 + i * 11, y + 8, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCheeseWedge(ctx, x, y) {
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(x, y + 24);
  ctx.lineTo(x + 36, y + 24);
  ctx.lineTo(x + 36, y);
  ctx.closePath();
  ctx.fill();
  // Cheese holes
  ctx.fillStyle = "#eab308";
  ctx.beginPath();
  ctx.arc(x + 22, y + 18, 3, 0, Math.PI * 2);
  ctx.arc(x + 30, y + 12, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// -------------------------------------------------------------
// 5. STORAGE CABINET (Right Side)
// -------------------------------------------------------------
function drawStorageCabinet(ctx, inventory, storageX = 860) {
  const sx = storageX;
  const sy = 155;
  const sw = 140;
  const sh = 195;

  // Blue Cabinet Frame
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  roundRect(ctx, sx, sy, sw, sh, 10);
  ctx.fill();

  // Highlight border
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Storage Banner Header
  ctx.fillStyle = "#1e40af";
  ctx.beginPath();
  roundRect(ctx, sx + 18, sy - 18, sw - 36, 24, 6);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("📦 Storage", sx + sw / 2, sy - 2);

  // Interior Compartment
  ctx.fillStyle = "#334155";
  ctx.fillRect(sx + 8, sy + 12, sw - 16, sh - 20);

  // Shelf Planks
  ctx.fillStyle = "#64748b";
  ctx.fillRect(sx + 8, sy + 70, sw - 16, 6);
  ctx.fillRect(sx + 8, sy + 130, sw - 16, 6);

  // Top Shelf: 3 Delivery Cardboard Boxes
  drawCardboardBox(ctx, sx + 16, sy + 25, 30, 36);
  drawCardboardBox(ctx, sx + 54, sy + 22, 32, 38);
  drawCardboardBox(ctx, sx + 92, sy + 25, 30, 36);

  // Middle Shelf: 4 Stored Milk Cartons
  for (let i = 0; i < 4; i++) {
    drawMilkCarton(ctx, sx + 18 + i * 28, sy + 78);
  }

  // Bottom Shelf: 1 Orange Box + 1 Pink Crate
  ctx.fillStyle = "#ea580c";
  ctx.fillRect(sx + 20, sy + 144, 42, 34);
  ctx.fillStyle = "#db2777";
  ctx.fillRect(sx + 74, sy + 148, 48, 30);

  // Potted plant neatly grounded beside storage cabinet base
  drawPottedPlant(ctx, sx - 22, sy + sh - 8, 1.0);

  // Floating Guidance Speech Bubble: "Go here to restock items!"
  const bx = sx - 115;
  const by = sy + 25;
  const bw = 104;
  const bh = 38;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#1e3a8a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundRect(ctx, bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#1e3a8a";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Go here to", bx + bw / 2, by + 15);
  ctx.fillText("restock items!", bx + bw / 2, by + 27);

  // Curved blue dashed arrow pointing to storage
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(bx + bw, by + bh / 2);
  ctx.lineTo(sx + 5, sy + 30);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCardboardBox(ctx, x, y, w, h) {
  ctx.fillStyle = "#d97706";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#b45309";
  ctx.fillRect(x + w / 2 - 2, y, 4, h);
}

// -------------------------------------------------------------
// 6. CHECKOUT COUNTER TABLE & CASHIER AREA
// -------------------------------------------------------------
function drawCheckoutCounter(ctx, activeCustomer, checkoutX = 608) {
  const cx = checkoutX;
  const cy = 410;
  const cw = 310;
  const ch = 95;

  // Green Checkered Rug on Floor
  const rx = cx + 22;
  const ry = cy + 75;
  const rw = 265;
  const rh = 34;

  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  roundRect(ctx, rx, ry, rw, rh, 8);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  roundRect(ctx, rx, ry, rw, rh, 8);
  ctx.clip();
  const cSize = 12;
  for (let y = ry; y < ry + rh; y += cSize) {
    for (let x = rx; x < rx + rw; x += cSize) {
      if ((Math.floor((x - rx) / cSize) + Math.floor((y - ry) / cSize)) % 2 === 0) {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(x, y, cSize, cSize);
      }
    }
  }
  ctx.restore();

  // Long Wooden Counter Table
  ctx.fillStyle = "#be123c"; // Crimson front face
  ctx.beginPath();
  roundRect(ctx, cx, cy, cw, ch, 8);
  ctx.fill();

  // Light honey wooden countertop
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  roundRect(ctx, cx + 2, cy + 2, cw - 4, 32, 6);
  ctx.fill();

  // POS Computer on counter
  const compX = cx + 45;
  const compY = cy - 30;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  roundRect(ctx, compX, compY, 58, 42, 5);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(compX + 4, compY + 4, 50, 34);
  // Green POS screen line
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(compX + 8, compY + 12, 32, 3);
  // Monitor stand
  ctx.fillStyle = "#334155";
  ctx.fillRect(compX + 24, compY + 42, 10, 14);
  ctx.fillRect(compX + 16, compY + 54, 26, 4);

  // Barcode Handheld Scanner on stand
  const scanX = compX + 68;
  const scanY = cy - 8;
  ctx.fillStyle = "#475569";
  ctx.fillRect(scanX, scanY, 8, 28);
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  roundRect(ctx, scanX - 4, scanY - 10, 16, 12, 3);
  ctx.fill();

  // Hot Pink Shopping Tote / Bag
  const bagX = scanX + 32;
  const bagY = cy - 5;
  ctx.fillStyle = "#ec4899";
  ctx.beginPath();
  roundRect(ctx, bagX, bagY, 44, 28, 4);
  ctx.fill();
  ctx.strokeStyle = "#db2777";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bagX + 22, bagY + 2, 10, Math.PI, 0);
  ctx.stroke();

  // Small potted succulents on counter corners
  drawPottedPlant(ctx, cx + 18, cy + 14, 0.6);
  drawPottedPlant(ctx, cx + cw - 18, cy + 14, 0.6);
}

// -------------------------------------------------------------
// 7. ANIMATED DYNAMIC CUSTOMERS (Lifecycle: Enter -> Browse -> Pick -> Checkout -> Leave)
// -------------------------------------------------------------
function drawCustomers(ctx, customers, filterFn) {
  if (!customers || !Array.isArray(customers)) return;
  // Sort by Y so characters with greater Y draw in front of characters with smaller Y
  const visible = customers
    .filter(c => c && c.state !== "WAITING_TO_ENTER" && c.state !== "EXITED")
    .filter(c => (typeof filterFn === "function" ? filterFn(c) : true))
    .sort((a, b) => (a.y || 0) - (b.y || 0));

  visible.forEach(c => {
    drawAnimatedCustomer(ctx, c);
  });
}

function drawAnimatedCustomer(ctx, cust) {
  const { 
    x, 
    y, 
    facing = "down", 
    isMoving = false, 
    walkFrame = 0, 
    profile = {}, 
    state, 
    pickTimer, 
    leaveTimer, 
    items = [] 
  } = cust;

  const shirtColor = profile.shirtColor || "#f472b6";
  const pantsColor = profile.pantsColor || "#3b82f6";
  const hairColor = profile.hairColor || "#3e2723";
  const hairStyle = profile.hairStyle || "buns";
  const skinColor = profile.skinColor || "#fed7aa";

  ctx.save();

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 22, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Walking leg swing animation (smooth pace matching leisurely walk)
  const legSwing = isMoving ? Math.sin(walkFrame * 0.22) * 3.8 : 0;
  ctx.fillStyle = pantsColor;
  ctx.fillRect(x - 6, y + 10 + legSwing, 4.5, 12 - Math.max(0, legSwing));
  ctx.fillRect(x + 1.5, y + 10 - legSwing, 4.5, 12 - Math.max(0, -legSwing));

  // Body / Shirt
  ctx.fillStyle = shirtColor;
  ctx.beginPath();
  roundRect(ctx, x - 11, y - 6, 22, 18, 4);
  ctx.fill();

  // Shopping Basket or Bag in hand
  if (state === "LEAVING" || state === "PAYMENT_COMPLETED") {
    // Hot Pink Grocery Bag in hand
    const bagHandX = facing === "left" ? x - 16 : x + 12;
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    roundRect(ctx, bagHandX, y + 2, 12, 14, 2);
    ctx.fill();
    ctx.strokeStyle = "#db2777";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bagHandX + 6, y + 2, 4, Math.PI, 0);
    ctx.stroke();
  } else if (state !== "WAITING_TO_ENTER" && state !== "EXITED") {
    // Woven Wicker Shopping Basket
    const basketX = facing === "left" ? x - 17 : x + 8;
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    roundRect(ctx, basketX, y + 2, 14, 11, 2);
    ctx.fill();
    ctx.strokeStyle = "#78350f";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(basketX + 7, y + 2, 5, Math.PI, 0);
    ctx.stroke();
    // Groceries inside basket if customer has picked items
    if (cust.basketItems && cust.basketItems.length > 0) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(basketX + 4, y + 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(basketX + 10, y + 1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Head
  ctx.fillStyle = skinColor;
  ctx.beginPath();
  ctx.arc(x, y - 16, 13, 0, Math.PI * 2);
  ctx.fill();

  // Face details (eyes, rosy cheeks, smile)
  if (facing !== "up") {
    const eyeOffsetX = facing === "left" ? -3 : facing === "right" ? 3 : 0;
    // Eyes
    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.arc(x - 4 + eyeOffsetX, y - 16, 2, 0, Math.PI * 2);
    ctx.arc(x + 4 + eyeOffsetX, y - 16, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(x + eyeOffsetX, y - 12, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
    ctx.beginPath();
    ctx.arc(x - 7 + eyeOffsetX, y - 14, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 7 + eyeOffsetX, y - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hair
  ctx.fillStyle = hairColor;
  if (facing === "up") {
    ctx.beginPath();
    ctx.arc(x, y - 17, 14, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y - 20, 13, Math.PI, 0);
    ctx.fill();
  }

  // Hair Style details
  if (hairStyle === "buns") {
    ctx.beginPath();
    ctx.arc(x - 13, y - 22, 6, 0, Math.PI * 2);
    ctx.arc(x + 13, y - 22, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (hairStyle === "bob") {
    ctx.fillRect(x - 13, y - 20, 4, 12);
    ctx.fillRect(x + 9, y - 20, 4, 12);
  } else if (hairStyle === "ponytail") {
    ctx.beginPath();
    ctx.arc(x + 13, y - 22, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (hairStyle === "spiky") {
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 26);
    ctx.lineTo(x - 5, y - 33);
    ctx.lineTo(x, y - 26);
    ctx.lineTo(x + 5, y - 33);
    ctx.lineTo(x + 10, y - 26);
    ctx.closePath();
    ctx.fill();
  }

  // --- FLOATING SPEECH / THOUGHT BUBBLES ---
  if (state === "PICKING") {
    // Thought bubble: picking item with gentle bounce
    const targetItem = cust.shelfTargets?.[cust.currentShelfIndex];
    const emoji = targetItem?.emoji || "🛒";
    const bubbleY = y - 50 - Math.sin((pickTimer || 0) * 0.15) * 3;

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    roundRect(ctx, x - 28, bubbleY, 56, 24, 8);
    ctx.fill();
    ctx.stroke();

    // Thought dots
    ctx.beginPath();
    ctx.arc(x, bubbleY + 28, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${emoji} +1`, x, bubbleY + 17);
  } else if (state === "BEING_SERVED") {
    // Checkout Order Bubble: [Item] xQty ₹Total
    const obX = x - 44;
    const obY = y - 56;
    const obW = 80;
    const obH = 30;

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(ctx, obX, obY, obW, obH, 8);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer tail
    ctx.beginPath();
    ctx.moveTo(x - 4, obY + obH);
    ctx.lineTo(x + 2, obY + obH + 6);
    ctx.lineTo(x + 8, obY + obH);
    ctx.closePath();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();

    const orderEmoji = items[0]?.emoji || "📦";
    const orderQty = items[0]?.quantity || 1;
    const billTotal = cust.billTotal || 20;

    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${orderEmoji} x${orderQty}`, obX + 8, obY + 19);

    ctx.font = "bold 11.5px sans-serif";
    ctx.fillStyle = "#059669";
    ctx.fillText(`₹${billTotal}`, obX + 46, obY + 19);
  } else if (state === "PAYMENT_COMPLETED" || (state === "LEAVING" && (leaveTimer || 0) > 0)) {
    // Happy Heart "Thank you!" Bubble
    const hbY = y - 52 - Math.sin((leaveTimer || 0) * 0.2) * 4;
    ctx.fillStyle = "#fdf2f8";
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(ctx, x - 46, hbY, 92, 26, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#be185d";
    ctx.font = "bold 11.5px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❤️ Thank you!", x, hbY + 17);
  } else if (state === "QUEUING") {
    // Small waiting bubble
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    roundRect(ctx, x - 15, y - 44, 30, 18, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#64748b";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("...", x, y - 32);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// 8. VENDOR PLAYER CHARACTER (Polished avatar with clear sparkling eyes, clothes & sneakers)
// -------------------------------------------------------------
function drawVendor(ctx, pos, facing, moving, frame, carryingItem) {
  const { x, y } = pos;
  const walkBob = moving ? Math.sin(frame * 0.35) * 2.0 : 0;
  const legSwing = moving ? Math.sin(frame * 0.35) * 4.5 : 0;

  ctx.save();

  // Subtle directional floor shadow under feet
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(x, y + 25, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Soft direction indicator dot only when moving
  if (moving) {
    const dirOffsetX = facing === "left" ? -18 : facing === "right" ? 18 : 0;
    const dirOffsetY = facing === "up" ? -14 : facing === "down" ? 18 : 0;
    ctx.fillStyle = "rgba(56, 189, 248, 0.55)";
    ctx.beginPath();
    ctx.arc(x + dirOffsetX, y + 20 + dirOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 1. SNEAKERS & SOCKS
  // White socks
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 7, y + 13 + legSwing, 4.5, 6);
  ctx.fillRect(x + 2.5, y + 13 - legSwing, 4.5, 6);

  // Red Canvas Sneakers with white rubber soles and toe caps
  const shoeLeftX = x - 9;
  const shoeLeftY = y + 18 + legSwing;
  const shoeRightX = x + 1.5;
  const shoeRightY = y + 18 - legSwing;

  // Red canvas shoe body
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  roundRect(ctx, shoeLeftX, shoeLeftY, 8, 6, 2);
  roundRect(ctx, shoeRightX, shoeRightY, 8, 6, 2);
  ctx.fill();

  // White rubber toe caps
  ctx.fillStyle = "#f8fafc";
  ctx.beginPath();
  ctx.arc(shoeLeftX + (facing === "left" ? 1.5 : 6.5), shoeLeftY + 3, 2.6, 0, Math.PI * 2);
  ctx.arc(shoeRightX + (facing === "left" ? 1.5 : 6.5), shoeRightY + 3, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // White rubber soles
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(shoeLeftX - 0.5, shoeLeftY + 5, 9, 2);
  ctx.fillRect(shoeRightX - 0.5, shoeRightY + 5, 9, 2);

  // 2. DENIM PANTS / JEANS
  ctx.fillStyle = "#1e3a8a";
  ctx.fillRect(x - 7.5, y + 7 + legSwing, 5, 7);
  ctx.fillRect(x + 2.5, y + 7 - legSwing, 5, 7);

  // 3. COLLARED SHIRT
  // Golden yellow vendor polo
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  roundRect(ctx, x - 12, y - 7 + walkBob, 24, 18, 4);
  ctx.fill();

  // White shirt collar flaps
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 7 + walkBob);
  ctx.lineTo(x - 1, y - 2 + walkBob);
  ctx.lineTo(x - 6, y - 3 + walkBob);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + 5, y - 7 + walkBob);
  ctx.lineTo(x + 1, y - 2 + walkBob);
  ctx.lineTo(x + 6, y - 3 + walkBob);
  ctx.closePath();
  ctx.fill();

  // 4. ROYAL BLUE APRON / OVERALLS
  ctx.fillStyle = "#2563eb";
  ctx.beginPath();
  roundRect(ctx, x - 10, y - 3 + walkBob, 20, 16, 4);
  ctx.fill();

  // Overalls Straps
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(x - 8, y - 7 + walkBob, 3.5, 6);
  ctx.fillRect(x + 4.5, y - 7 + walkBob, 3.5, 6);

  // Golden Brass Buttons on straps
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x - 6.2, y - 1 + walkBob, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 6.2, y - 1 + walkBob, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Front Apron Pocket
  ctx.fillStyle = "#1d4ed8";
  ctx.beginPath();
  roundRect(ctx, x - 5, y + 4 + walkBob, 10, 7, 2);
  ctx.fill();

  // Little red barcode pen in pocket
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - 2, y + 1 + walkBob, 2, 4);

  // Name badge on chest
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x - 8, y + 1 + walkBob, 4, 2.5);

  // 5. ARMS & SLEEVES
  const armSwing = moving ? Math.sin(frame * 0.35) * 3 : 0;
  // Sleeves
  ctx.fillStyle = "#f59e0b";
  ctx.fillRect(x - 14, y - 4 + walkBob - armSwing, 4, 6);
  ctx.fillRect(x + 10, y - 4 + walkBob + armSwing, 4, 6);
  // Forearms & Hands
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  roundRect(ctx, x - 14, y + 2 + walkBob - armSwing, 3.5, 8, 1.5);
  roundRect(ctx, x + 10.5, y + 2 + walkBob + armSwing, 3.5, 8, 1.5);
  ctx.fill();

  // 6. HEAD & HAIR (Back of hair drawn first!)
  ctx.fillStyle = "#451a03"; // Rich chestnut hair
  ctx.beginPath();
  ctx.arc(x, y - 18 + walkBob, 15, 0, Math.PI * 2);
  ctx.fill();

  // Face circle
  ctx.fillStyle = "#fed7aa";
  ctx.beginPath();
  ctx.arc(x, y - 16 + walkBob, 13, 0, Math.PI * 2);
  ctx.fill();

  // Hair bangs (drawn strictly ABOVE the eyes at the hairline!)
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(x, y - 22 + walkBob, 13, Math.PI, 0); // Top dome of hair
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x - 12, y - 21 + walkBob);
  ctx.lineTo(x - 6, y - 22 + walkBob);
  ctx.lineTo(x - 2, y - 20 + walkBob);
  ctx.lineTo(x + 3, y - 22 + walkBob);
  ctx.lineTo(x + 8, y - 20 + walkBob);
  ctx.lineTo(x + 12, y - 21 + walkBob);
  ctx.lineTo(x + 12, y - 26 + walkBob);
  ctx.lineTo(x - 12, y - 26 + walkBob);
  ctx.closePath();
  ctx.fill();

  // Cute Red Shopkeeper Cap on head
  ctx.fillStyle = "#be123c";
  ctx.beginPath();
  roundRect(ctx, x - 13, y - 29 + walkBob, 26, 7, 3);
  ctx.fill();
  // Cap visor brim
  ctx.fillStyle = "#9f1239";
  ctx.beginPath();
  roundRect(ctx, x - 11, y - 23 + walkBob, 22, 3, 1.5);
  ctx.fill();
  // Golden star badge on cap
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(x, y - 26 + walkBob, 2, 0, Math.PI * 2);
  ctx.fill();

  // 7. BIG SPARKLING EYES, EYEBROWS, SMILE & ROSY BLUSH (ALWAYS ON TOP!)
  if (facing !== "up") {
    const eyeShiftX = facing === "left" ? -3 : facing === "right" ? 3 : 0;

    // Eyebrows
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x - 5 + eyeShiftX, y - 20 + walkBob, 3, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.arc(x + 5 + eyeShiftX, y - 20 + walkBob, 3, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Eyes: White sclera base
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x - 5 + eyeShiftX, y - 16 + walkBob, 3.2, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 5 + eyeShiftX, y - 16 + walkBob, 3.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris & Pupil (Deep expressive indigo/espresso)
    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.arc(x - 5 + eyeShiftX + (facing === "left" ? -1 : facing === "right" ? 1 : 0), y - 16 + walkBob, 2.3, 0, Math.PI * 2);
    ctx.arc(x + 5 + eyeShiftX + (facing === "left" ? -1 : facing === "right" ? 1 : 0), y - 16 + walkBob, 2.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlight / sparkles
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x - 6 + eyeShiftX, y - 17 + walkBob, 1.1, 0, Math.PI * 2);
    ctx.arc(x + 4 + eyeShiftX, y - 17 + walkBob, 1.1, 0, Math.PI * 2);
    ctx.arc(x - 4 + eyeShiftX, y - 15 + walkBob, 0.6, 0, Math.PI * 2);
    ctx.arc(x + 6 + eyeShiftX, y - 15 + walkBob, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Cute upper eyelash line
    ctx.strokeStyle = "#1e1b4b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x - 5 + eyeShiftX, y - 17.5 + walkBob, 3.4, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.arc(x + 5 + eyeShiftX, y - 17.5 + walkBob, 3.4, 1.1 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Rosy Cheeks
    ctx.fillStyle = "rgba(244, 63, 94, 0.45)";
    ctx.beginPath();
    ctx.arc(x - 8 + eyeShiftX, y - 13 + walkBob, 2.8, 0, Math.PI * 2);
    ctx.arc(x + 8 + eyeShiftX, y - 13 + walkBob, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute Smile with red tongue
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(x + eyeShiftX, y - 11 + walkBob, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#9a3412";
    ctx.lineWidth = 1.3;
    ctx.stroke();
  } else {
    // Facing up: back of cap and hair
    ctx.fillStyle = "#be123c";
    ctx.beginPath();
    ctx.arc(x, y - 20 + walkBob, 14, Math.PI, 0);
    ctx.fill();
  }

  // 8. Carrying item if present
  if (carryingItem) {
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(carryingItem.emoji || "📦", x, y - 2 + walkBob);
  }

  ctx.restore();
}

// -------------------------------------------------------------
// 9. CONTEXTUAL INTERACTION PROMPT
// -------------------------------------------------------------
function drawInteractionPrompt(ctx, interactable) {
  const { x, y, name, type } = interactable;
  const promptText = type === "checkout" 
    ? "Press E or Click to Checkout" 
    : type === "storage" 
    ? "Press E or Click to Restock" 
    : `Press E or Click to Inspect ${name}`;

  ctx.font = "bold 12px sans-serif";
  const textWidth = ctx.measureText(promptText).width;
  const pw = textWidth + 38;
  const ph = 32;
  const px = x - pw / 2;
  const py = y - 28;

  const pulse = Math.sin(Date.now() / 180) * 2;

  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.2;
  ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  roundRect(ctx, px, py + pulse, pw, ph, 16);
  ctx.fill();
  ctx.stroke();

  // "E" key badge
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  roundRect(ctx, px + 6, py + 6 + pulse, 20, 20, 4);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("E", px + 16, py + 20 + pulse);

  // Label text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11.5px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(promptText, px + 32, py + 20 + pulse);
  ctx.restore();
}

function drawPottedPlant(ctx, x, y, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Soft ground shadow under pot
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.beginPath();
  ctx.ellipse(0, 16.5, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta Pot
  ctx.fillStyle = "#c25c38";
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(10, 0);
  ctx.lineTo(7, 16);
  ctx.lineTo(-7, 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e0705a";
  ctx.beginPath();
  roundRect(ctx, -12, -3, 24, 4.5, 2);
  ctx.fill();

  // Green Bush Leaves
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.arc(0, -10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(-4, -12, 7, 0, Math.PI * 2);
  ctx.arc(4, -12, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}
