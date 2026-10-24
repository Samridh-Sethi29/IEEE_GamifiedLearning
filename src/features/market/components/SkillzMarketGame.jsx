import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import MarketCanvas, { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_OBJECTS, OBSTACLES } from "./MarketCanvas";
import MarketHUD from "./MarketHUD";
import CheckoutModal from "./CheckoutModal";
import RestockModal from "./RestockModal";
import ShelfDetailModal from "./ShelfDetailModal";
import DaySummaryModal from "./DaySummaryModal";
import VirtualControls from "./VirtualControls";
import { PRODUCTS, DEFAULT_GOALS } from "../utils/constants";
import { generateCustomer } from "../utils/marketLogic";
import { marketAudio } from "../utils/marketAudio";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const PLAYER_SPEED = 4.4;

// Helper to construct a dynamic customer agent with waypoint and shelf goals
function createCustomerAgent(inv, existingIds = [], delayFrames = 0) {
  const base = generateCustomer(inv, existingIds, "beginner");
  
  // Extract unique shelves needed for this customer's order
  const shelfTargets = [];
  const seenShelves = new Set();
  base.items.forEach((it) => {
    if (!seenShelves.has(it.shelf)) {
      seenShelves.add(it.shelf);
      shelfTargets.push({
        shelfKey: it.shelf,
        productId: it.productId,
        quantity: it.quantity,
        emoji: it.emoji || "📦",
        name: it.name
      });
    }
  });

  return {
    ...base,
    state: delayFrames > 0 ? "WAITING_TO_ENTER" : "ENTERING",
    spawnTimer: delayFrames,
    x: 60,
    y: 110,
    facing: "down",
    isMoving: false,
    walkFrame: 0,
    shelfTargets,
    currentShelfIndex: 0,
    pickTimer: 0,
    leaveTimer: 0,
    basketItems: [],
    waypointStep: 0
  };
}

function createInitialCustomers(inv, count = 3) {
  const custs = [];
  const existingIds = [];
  for (let i = 0; i < count; i++) {
    // Stagger arrival delays:
    // First customer enters immediately (0 delay)
    // Subsequent customers have sequential delays
    const delay = i * 260;
    const cust = createCustomerAgent(inv, existingIds, delay);
    existingIds.push(cust.profile?.id);
    custs.push(cust);
  }
  return custs;
}

export default function SkillzMarketGame() {
  const { player, earnXP, addCoins, markWorldCompleted } = usePlayer();

  // Dynamic viewport tracking
  const [viewport, setViewport] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1024,
    h: typeof window !== "undefined" ? window.innerHeight : 576
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = Math.min(window.innerHeight, document.documentElement.clientHeight || window.innerHeight);
      setViewport({ w, h });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute dynamic layout extending from left to right across the entire screen
  const aspect = Math.max(16 / 9, viewport.w / Math.max(240, viewport.h));
  const canvasWidth = Math.max(1024, Math.round(576 * aspect));
  const canvasHeight = 576;

  const storageX = canvasWidth - 164;
  const checkoutX = canvasWidth - 416;
  const leftBound = 195;
  const shelfWidth = 175;
  const shelfGap = 105; // Generous, wide gap between shelves with prominent plant pot aisles
  const totalShelvesSpan = (shelfWidth * 3) + (shelfGap * 2); // 525 + 210 = 735
  const availableSpan = storageX - leftBound;
  // Centering shelves with equal distance on both left and right sides
  const sideMargin = Math.max(24, Math.floor((availableSpan - totalShelvesSpan) / 2));

  const shelfDrinksX = leftBound + sideMargin;
  const shelfSnacksX = shelfDrinksX + shelfWidth + shelfGap;
  const shelfFoodX = shelfSnacksX + shelfWidth + shelfGap;

  const layout = useMemo(() => ({
    canvasWidth,
    canvasHeight,
    storageX,
    checkoutX,
    shelfDrinksX,
    shelfSnacksX,
    shelfFoodX,
    shelfGap
  }), [canvasWidth, canvasHeight, storageX, checkoutX, shelfDrinksX, shelfSnacksX, shelfFoodX, shelfGap]);

  // Dynamic interactive targets aligned with extended layout
  const interactiveTargets = useMemo(() => [
    {
      id: "checkout",
      type: "checkout",
      name: "Checkout Counter",
      box: { x: checkoutX, y: 410, w: 310, h: 95 },
      cx: checkoutX + 155,
      cy: 395,
      maxDist: 105
    },
    {
      id: "storage",
      type: "storage",
      name: "Storage Room",
      box: { x: storageX, y: 155, w: 140, h: 195 },
      cx: storageX + 70,
      cy: 220,
      maxDist: 105
    },
    {
      id: "drinks",
      type: "shelf",
      shelfKey: "drinks",
      name: "Drinks Shelf",
      box: { x: shelfDrinksX, y: 110, w: 175, h: 180 },
      cx: shelfDrinksX + 87,
      cy: 230,
      maxDist: 100
    },
    {
      id: "snacks",
      type: "shelf",
      shelfKey: "snacks",
      name: "Snacks Shelf",
      box: { x: shelfSnacksX, y: 110, w: 175, h: 180 },
      cx: shelfSnacksX + 87,
      cy: 230,
      maxDist: 100
    },
    {
      id: "food",
      type: "shelf",
      shelfKey: "food",
      name: "Food Shelf",
      box: { x: shelfFoodX, y: 110, w: 175, h: 180 },
      cx: shelfFoodX + 87,
      cy: 230,
      maxDist: 100
    }
  ], [checkoutX, storageX, shelfDrinksX, shelfSnacksX, shelfFoodX]);

  // Dynamic collision obstacles spanning the extended world
  const dynamicObstacles = useMemo(() => [
    { x: 0, y: 0, w: canvasWidth, h: 150 },
    { x: 0, y: 550, w: canvasWidth, h: 26 },
    { x: 0, y: 0, w: 182, h: 576 },
    { x: canvasWidth - 30, y: 0, w: 30, h: 576 },
    { x: 180, y: 140, w: 15, h: 320 },
    { x: shelfDrinksX, y: 120, w: 175, h: 160 },
    { x: shelfSnacksX, y: 120, w: 175, h: 160 },
    { x: shelfFoodX, y: 120, w: 175, h: 160 },
    { x: storageX, y: 155, w: 140, h: 190 },
    { x: checkoutX, y: 410, w: 310, h: 90 }
  ], [canvasWidth, shelfDrinksX, shelfSnacksX, shelfFoodX, storageX, checkoutX]);

  // Shop inventory state (fresh v3 key ensures full shelves on startup)
  const [inventory, setInventory] = useState(() => {
    const initial = {};
    Object.keys(PRODUCTS).forEach((k) => {
      initial[k] = {
        shelf: PRODUCTS[k].initialShelf,
        storage: PRODUCTS[k].initialStorage
      };
    });

    try {
      const saved = localStorage.getItem("skillz_market_inventory_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(PRODUCTS).forEach((k) => {
          if (parsed[k] && parsed[k].shelf !== undefined && parsed[k].shelf > 0) {
            initial[k] = parsed[k];
          }
        });
      }
    } catch (e) {}

    return initial;
  });

  const inventoryRef = useRef(inventory);
  inventoryRef.current = inventory;

  // Daily goals state (fresh v4 ensures only scheduled customer goal)
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem("skillz_market_goals_v4");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_GOALS.map((g) => ({ ...g }));
  });

  // Sales / Money counter (starts at ₹0, persists and increases only)
  const [salesEarned, setSalesEarned] = useState(() => {
    try {
      const saved = localStorage.getItem("skillz_market_sales_v4");
      if (saved !== null) {
        const val = Number(saved);
        if (!isNaN(val)) return val;
      }
    } catch (e) {}
    return 0;
  });

  // Sound mute state
  const [isMuted, setIsMuted] = useState(false);

  // Daily stats tracking
  const [dailyStats, setDailyStats] = useState({
    customersServed: 0,
    revenueEarned: 0,
    changeAccuracy: 100,
    itemsRestocked: 0
  });

  // Player position & animation state
  const [playerPos, setPlayerPos] = useState({ x: 480, y: 345 });
  const playerPosRef = useRef({ x: 480, y: 345 });
  playerPosRef.current = playerPos;

  const [playerFacing, setPlayerFacing] = useState("right");
  const [playerMoving, setPlayerMoving] = useState(false);
  const [playerFrame, setPlayerFrame] = useState(0);
  const [carryingItem, setCarryingItem] = useState(null);

  // Input references
  const keysDown = useRef({});
  const joystickDir = useRef({ x: 0, y: 0 });

  // Interactive target reference to avoid stale closures
  const [nearbyInteractable, setNearbyInteractable] = useState(null);
  const nearbyRef = useRef(null);
  nearbyRef.current = nearbyInteractable;

  // Modals state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isShelfDetailOpen, setIsShelfDetailOpen] = useState(false);
  const [selectedShelfCategory, setSelectedShelfCategory] = useState("drinks");
  const [isGameCompletedOpen, setIsGameCompletedOpen] = useState(false);

  const anyModalOpen = isCheckoutOpen || isRestockOpen || isShelfDetailOpen || isGameCompletedOpen;
  const anyModalOpenRef = useRef(anyModalOpen);
  anyModalOpenRef.current = anyModalOpen;

  // Dynamic autonomous customers with staggered arrival timers
  const [customers, setCustomers] = useState(() => createInitialCustomers(inventory));
  const customersRef = useRef(customers);
  customersRef.current = customers;

  // Active customer at checkout counter (dynamically assigned when reaching service spot)
  const [activeCustomer, setActiveCustomer] = useState(null);
  const activeCustomerRef = useRef(null);
  activeCustomerRef.current = activeCustomer;

  // Persist inventory & goals
  useEffect(() => {
    try {
      localStorage.setItem("skillz_market_inventory_v3", JSON.stringify(inventory));
    } catch (e) {}
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem("skillz_market_goals_v4", JSON.stringify(goals));
    } catch (e) {}
  }, [goals]);

  // Handle interaction trigger (reliably called from E key, Space, Enter, on-screen buttons, or canvas click)
  const triggerInteraction = useCallback((specificType, specificKey) => {
    try {
      marketAudio.playClick();
    } catch (e) {}

    if (specificType === "checkout") {
      const custToServe = activeCustomerRef.current || 
        customersRef.current.find(c => ["BEING_SERVED", "QUEUING", "TO_CHECKOUT"].includes(c.state));

      if (custToServe) {
        if (!activeCustomerRef.current || activeCustomerRef.current.id !== custToServe.id) {
          activeCustomerRef.current = custToServe;
          setActiveCustomer(custToServe);
        }
        setIsCheckoutOpen(true);
      }
      return;
    }
    if (specificType === "storage") {
      setIsRestockOpen(true);
      return;
    }
    if (specificType === "shelf") {
      setSelectedShelfCategory(specificKey || "drinks");
      setIsShelfDetailOpen(true);
      return;
    }

    let target = nearbyRef.current;

    // Generous fallback: if not strictly nearby, find closest target in room within 200px
    if (!target) {
      const px = playerPosRef.current.x;
      const py = playerPosRef.current.y;
      let nearest = null;
      let minDist = 200;

      for (const t of interactiveTargets) {
        const d = getDistToRect(px, py, t.box.x, t.box.y, t.box.w, t.box.h);
        if (d < minDist) {
          minDist = d;
          nearest = t;
        }
      }
      target = nearest;
    }

    if (!target) return;

    if (target.type === "checkout") {
      const custToServe = activeCustomerRef.current || 
        customersRef.current.find(c => ["BEING_SERVED", "QUEUING", "TO_CHECKOUT"].includes(c.state));

      if (custToServe) {
        if (!activeCustomerRef.current || activeCustomerRef.current.id !== custToServe.id) {
          activeCustomerRef.current = custToServe;
          setActiveCustomer(custToServe);
        }
        setIsCheckoutOpen(true);
      }
    } else if (target.type === "storage") {
      setIsRestockOpen(true);
    } else if (target.type === "shelf") {
      setSelectedShelfCategory(target.shelfKey);
      setIsShelfDetailOpen(true);
    }
  }, [interactiveTargets]);

  // Global Keyboard event handler with capture phase (supports E, e, Space, Enter, Arrows, WASD)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toLowerCase() : "";
      const code = e.code || "";

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(code)) {
        e.preventDefault();
      }
      keysDown.current[code] = true;

      // Interaction key ('e' or 'E' or Space or Enter)
      const isInteract = key === "e" || code === "KeyE" || key === " " || code === "Space" || key === "enter" || code === "Enter";
      if (isInteract && !anyModalOpenRef.current) {
        e.preventDefault();
        triggerInteraction();
      }

      // Close modal on Escape
      if (key === "escape" || code === "Escape") {
        setIsCheckoutOpen(false);
        setIsRestockOpen(false);
        setIsShelfDetailOpen(false);
      }
    };

    const handleKeyUp = (e) => {
      keysDown.current[e.code || ""] = false;
    };

    const handleBlur = () => {
      keysDown.current = {};
      joystickDir.current = { x: 0, y: 0 };
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleBlur);
    };
  }, [triggerInteraction]);

  // Movement & Customer AI loop
  useEffect(() => {
    let animId;
    let stepCount = 0;

    const gameLoop = () => {
      // 1. Player movement
      if (!anyModalOpenRef.current) {
        let vx = 0;
        let vy = 0;

        if (keysDown.current["KeyW"] || keysDown.current["ArrowUp"]) vy -= 1;
        if (keysDown.current["KeyS"] || keysDown.current["ArrowDown"]) vy += 1;
        if (keysDown.current["KeyA"] || keysDown.current["ArrowLeft"]) vx -= 1;
        if (keysDown.current["KeyD"] || keysDown.current["ArrowRight"]) vx += 1;

        if (joystickDir.current.x !== 0 || joystickDir.current.y !== 0) {
          vx += joystickDir.current.x;
          vy += joystickDir.current.y;
        }

        const isMoving = vx !== 0 || vy !== 0;
        setPlayerMoving(isMoving);

        if (isMoving) {
          const mag = Math.sqrt(vx * vx + vy * vy);
          const normX = (vx / mag) * PLAYER_SPEED;
          const normY = (vy / mag) * PLAYER_SPEED;

          if (Math.abs(vx) > Math.abs(vy)) {
            setPlayerFacing(vx > 0 ? "right" : "left");
          } else {
            setPlayerFacing(vy > 0 ? "down" : "up");
          }

          setPlayerFrame((f) => f + 1);

          stepCount++;
          if (stepCount % 20 === 0) {
            marketAudio.playStep();
          }

          setPlayerPos((prev) => {
            const nextX = prev.x + normX;
            const nextY = prev.y + normY;

            const pBoxX = { x: nextX - 14, y: prev.y + 10, w: 28, h: 20 };
            const pBoxY = { x: prev.x - 14, y: nextY + 10, w: 28, h: 20 };

            let canMoveX = true;
            let canMoveY = true;

            for (const obs of dynamicObstacles) {
              if (checkOverlap(pBoxX, obs)) canMoveX = false;
              if (checkOverlap(pBoxY, obs)) canMoveY = false;
            }

            return {
              x: canMoveX ? Math.max(190, Math.min(canvasWidth - 40, nextX)) : prev.x,
              y: canMoveY ? Math.max(155, Math.min(canvasHeight - 35, nextY)) : prev.y
            };
          });
        }
      }

      // 2. Autonomous Customer AI & Waypoint Pathfinding
      const CUST_SPEED = 0.95; // Brisk, natural walking pace
      const currentCusts = customersRef.current;
      let custsChanged = false;
      let nextActiveCust = null;

      // Identify customers queuing for or currently at checkout
      const queueList = currentCusts.filter(c => 
        ["TO_CHECKOUT", "QUEUING", "BEING_SERVED"].includes(c.state)
      );

      const nextCusts = currentCusts.map((cust) => {
        let c = { ...cust };

        // WAITING TO ENTER (staggered timer + sequential entry gating so only one customer shops at a time)
        if (c.state === "WAITING_TO_ENTER") {
          if (c.spawnTimer > 0) {
            c.spawnTimer--;
          }
          // Only enter when spawn timer has elapsed AND no other customer is currently entering or shopping shelves
          const isAisleOccupied = currentCusts.some(
            (other) => other.id !== c.id && ["ENTERING", "WALKING_TO_SHELF", "PICKING"].includes(other.state)
          );
          // And checkout counter has at most 1 customer waiting
          const queueCount = currentCusts.filter(
            (other) => ["TO_CHECKOUT", "QUEUING", "BEING_SERVED"].includes(other.state)
          ).length;

          if (c.spawnTimer <= 0 && !isAisleOccupied && queueCount <= 1) {
            c.state = "ENTERING";
            c.x = 60; // Spawns in the ENTRY lane
            c.y = 110;
            c.waypointStep = 0;
            custsChanged = true;
          }
          return c;
        }

        // ENTERING (walks slowly down the ENTRY runner carpet, then turns into aisle)
        if (c.state === "ENTERING") {
          c.isMoving = true;
          c.walkFrame++;
          custsChanged = true;

          if (c.waypointStep === 0) {
            c.facing = "down";
            c.y += CUST_SPEED;
            if (c.y >= 335) {
              c.y = 335;
              c.waypointStep = 1;
            }
          } else if (c.waypointStep === 1) {
            c.facing = "right";
            c.x += CUST_SPEED;
            if (c.x >= 205) {
              c.x = 205;
              c.state = "WALKING_TO_SHELF";
              c.currentShelfIndex = 0;
            }
          }
          return c;
        }

        // WALKING TO SHELF (drinks, snacks, or food)
        if (c.state === "WALKING_TO_SHELF") {
          c.isMoving = true;
          c.walkFrame++;
          custsChanged = true;

          const targetInfo = c.shelfTargets[c.currentShelfIndex];
          const shelfKey = targetInfo?.shelfKey || "drinks";
          let targetShelfX = shelfDrinksX + 87;
          if (shelfKey === "snacks") targetShelfX = shelfSnacksX + 87;
          if (shelfKey === "food") targetShelfX = shelfFoodX + 87;
          const targetShelfY = 305;

          const dx = targetShelfX - c.x;
          const dy = targetShelfY - c.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= CUST_SPEED) {
            c.x = targetShelfX;
            c.y = targetShelfY;
            c.isMoving = false;
            c.facing = "up";
            c.state = "PICKING";
            c.pickTimer = 160; // ~2.6 seconds waiting & inspecting shelf
          } else {
            c.x += (dx / dist) * CUST_SPEED;
            c.y += (dy / dist) * CUST_SPEED;
            if (Math.abs(dx) > Math.abs(dy)) {
              c.facing = dx > 0 ? "right" : "left";
            } else {
              c.facing = dy > 0 ? "down" : "up";
            }
          }
          return c;
        }

        // PICKING ITEMS AT SHELF (waits for some time with thought bubble)
        if (c.state === "PICKING") {
          c.isMoving = false;
          c.facing = "up";
          c.pickTimer--;
          custsChanged = true;

          if (c.pickTimer <= 0) {
            const targetInfo = c.shelfTargets[c.currentShelfIndex];
            if (targetInfo) {
              c.basketItems = [...(c.basketItems || []), targetInfo];
            }
            try { marketAudio.playPick(); } catch (e) {}

            if (c.currentShelfIndex + 1 < c.shelfTargets.length) {
              c.currentShelfIndex++;
              c.state = "WALKING_TO_SHELF";
            } else {
              c.state = "TO_CHECKOUT";
              c.waypointStep = 0;
            }
          }
          return c;
        }

        // WALKING TO CHECKOUT / QUEUING (BEHIND THE COUNTER)
        if (c.state === "TO_CHECKOUT" || c.state === "QUEUING") {
          const slotIdx = queueList.findIndex(q => q.id === c.id);
          const targetSlot = Math.max(0, slotIdx);

          // Slots positioned behind the counter (counter table is at y = 410, so y = 370 is behind it)
          const slotX = targetSlot === 0 
            ? checkoutX + 220 
            : targetSlot === 1 
              ? checkoutX + 135 
              : checkoutX + 50;
          const slotY = 370; // Behind the counter on the floor, facing down

          let destX = slotX;
          let destY = slotY;
          if (c.y < 335) {
            destY = 335;
          }

          const dx = destX - c.x;
          const dy = destY - c.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= CUST_SPEED) {
            c.x = destX;
            c.y = destY;
            if (destY === 335 && slotY > 335) {
              c.facing = "down";
              c.isMoving = true;
              c.walkFrame++;
            } else {
              c.isMoving = false;
              c.facing = "down"; // Facing down towards the counter
              if (targetSlot === 0) {
                c.state = "BEING_SERVED";
                nextActiveCust = c;
              } else {
                c.state = "QUEUING";
              }
            }
            custsChanged = true;
          } else {
            c.isMoving = true;
            c.walkFrame++;
            c.x += (dx / dist) * CUST_SPEED;
            c.y += (dy / dist) * CUST_SPEED;
            if (Math.abs(dx) > Math.abs(dy)) {
              c.facing = dx > 0 ? "right" : "left";
            } else {
              c.facing = dy > 0 ? "down" : "up";
            }
            custsChanged = true;
          }
          return c;
        }

        // BEING SERVED AT CHECKOUT (Behind the counter at y = 370)
        if (c.state === "BEING_SERVED") {
          c.isMoving = false;
          c.facing = "down";
          c.x = checkoutX + 220;
          c.y = 370;
          nextActiveCust = c;
          return c;
        }

        // PAYMENT COMPLETED: Heart reaction & Thank you!
        if (c.state === "PAYMENT_COMPLETED") {
          c.isMoving = false;
          c.leaveTimer--;
          custsChanged = true;
          if (c.leaveTimer <= 0) {
            c.state = "LEAVING";
            c.waypointStep = 0;
          }
          return c;
        }

        // LEAVING: Walking back through aisle and out through the EXIT lane
        if (c.state === "LEAVING") {
          c.isMoving = true;
          c.walkFrame++;
          custsChanged = true;

          if (c.waypointStep === 0) {
            // Step north into open aisle at y = 335
            c.facing = "up";
            c.y -= CUST_SPEED;
            if (c.y <= 335) {
              c.y = 335;
              c.waypointStep = 1;
            }
          } else if (c.waypointStep === 1) {
            // Walk west along open aisle to x = 205
            c.facing = "left";
            c.x -= CUST_SPEED;
            if (c.x <= 205) {
              c.x = 205;
              c.waypointStep = 2;
            }
          } else if (c.waypointStep === 2) {
            // Turn into EXIT lane at x = 138 (beside Entry)
            c.facing = "left";
            c.x -= CUST_SPEED;
            if (c.x <= 138) {
              c.x = 138;
              c.waypointStep = 3;
            }
          } else if (c.waypointStep === 3) {
            // Walk north up the EXIT lane under the EXIT sign to doorway at y = 110
            c.facing = "up";
            c.y -= CUST_SPEED;
            if (c.y <= 110) {
              c.y = 110;
              c.state = "EXITED";
            }
          }
          return c;
        }

        return c;
      });

      // Filter exited customers without spawning infinite new customers (today's cohort is fixed)
      let finalCusts = nextCusts;
      if (finalCusts.some(c => c.state === "EXITED")) {
        finalCusts = finalCusts.filter(c => c.state !== "EXITED");
        custsChanged = true;
      }

      if (custsChanged) {
        customersRef.current = finalCusts;
        setCustomers(finalCusts);
      }

      if (nextActiveCust?.id !== activeCustomerRef.current?.id) {
        activeCustomerRef.current = nextActiveCust;
        setActiveCustomer(nextActiveCust);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [dynamicObstacles, canvasWidth, canvasHeight, shelfDrinksX, shelfSnacksX, shelfFoodX, checkoutX]);

  // Proximity detection to interactive objects using distance-to-box
  useEffect(() => {
    const px = playerPos.x;
    const py = playerPos.y;

    let closest = null;
    let minDistance = Infinity;

    for (const target of interactiveTargets) {
      const dist = getDistToRect(px, py, target.box.x, target.box.y, target.box.w, target.box.h);
      if (dist <= target.maxDist && dist < minDistance) {
        minDistance = dist;
        closest = {
          ...target,
          x: target.cx,
          y: target.cy,
          w: target.box.w,
          h: target.box.h
        };
      }
    }

    setNearbyInteractable(closest);
  }, [playerPos, interactiveTargets]);

  // Handle payment completion at checkout
  const handleProcessPayment = (servedCustomer) => {
    const revenue = servedCustomer.billTotal;

    // Deduct purchased items from shelf stock
    setInventory((prev) => {
      const updated = { ...prev };
      servedCustomer.items.forEach((item) => {
        if (updated[item.productId]) {
          updated[item.productId] = {
            ...updated[item.productId],
            shelf: Math.max(0, (updated[item.productId].shelf || 0) - item.quantity)
          };
        }
      });
      return updated;
    });

    // Update sales and rewards (starts at 0 and only increases, saved persistently)
    setSalesEarned((prev) => {
      const next = prev + revenue;
      try {
        localStorage.setItem("skillz_market_sales_v4", String(next));
      } catch (e) {}
      return next;
    });
    addCoins(revenue);
    earnXP(40);

    // Update daily stats
    setDailyStats((prev) => ({
      ...prev,
      customersServed: prev.customersServed + 1,
      revenueEarned: prev.revenueEarned + revenue
    }));

    // Update goals progress
    setGoals((prev) => {
      const nextGoals = prev.map((g) => {
        if (g.id === "serve_customers") {
          const nextVal = g.current + 1;
          return { ...g, current: nextVal, completed: nextVal >= g.target };
        }
        return g;
      });

      try {
        localStorage.setItem("skillz_market_goals_v4", JSON.stringify(nextGoals));
      } catch (e) {}

      // Check if all goals are completed
      const allCompleted = nextGoals.every((g) => g.completed || g.current >= g.target);
      if (allCompleted) {
        setTimeout(() => {
          marketAudio.playFanfare();
          setIsGameCompletedOpen(true);
          markWorldCompleted("market");
        }, 1200);
      }

      return nextGoals;
    });

    // Mark served customer as PAYMENT_COMPLETED with happy reaction timer
    const updatedCusts = customersRef.current.map((c) => {
      if (c.id === servedCustomer.id) {
        return {
          ...c,
          state: "PAYMENT_COMPLETED",
          leaveTimer: 85,
          isMoving: false
        };
      }
      return c;
    });

    customersRef.current = updatedCusts;
    setCustomers(updatedCusts);
    activeCustomerRef.current = null;
    setActiveCustomer(null);
  };

  // Handle Restocking from storage to shelf
  const handleRestockShelf = (productKey, quantity) => {
    setInventory((prev) => {
      const item = prev[productKey];
      if (!item) return prev;

      const newStorage = Math.max(0, item.storage - quantity);
      const newShelf = Math.min(PRODUCTS[productKey]?.maxShelf || 10, item.shelf + quantity);

      return {
        ...prev,
        [productKey]: {
          ...item,
          shelf: newShelf,
          storage: newStorage
        }
      };
    });

    setDailyStats((prev) => ({
      ...prev,
      itemsRestocked: prev.itemsRestocked + quantity
    }));

    // Check if restocking milk completes "Restock milk" goal
    if (productKey === "milk") {
      setGoals((prev) => {
        const nextGoals = prev.map((g) => {
          if (g.id === "restock_milk") {
            const nextVal = g.current + 1;
            return { ...g, current: nextVal, completed: nextVal >= g.target };
          }
          return g;
        });

        const allCompleted = nextGoals.every((g) => g.completed || g.current >= g.target);
        if (allCompleted) {
          setTimeout(() => {
            marketAudio.playFanfare();
            setIsGameCompletedOpen(true);
            markWorldCompleted("market");
          }, 1000);
        }

        return nextGoals;
      });
    }
  };

  // Restart Day
  const handleRestartDay = () => {
    const fullInventory = {};
    Object.keys(PRODUCTS).forEach((k) => {
      fullInventory[k] = {
        shelf: PRODUCTS[k].initialShelf,
        storage: PRODUCTS[k].initialStorage
      };
    });
    setInventory(fullInventory);
    // Note: Do NOT reset salesEarned; money continues increasing and accumulating persistently!
    const freshGoals = DEFAULT_GOALS.map((g) => ({ ...g, current: 0, completed: false }));
    setGoals(freshGoals);
    try {
      localStorage.setItem("skillz_market_goals_v4", JSON.stringify(freshGoals));
    } catch (e) {}
    setDailyStats({
      customersServed: 0,
      revenueEarned: 0,
      changeAccuracy: 100,
      itemsRestocked: 0
    });
    setPlayerPos({ x: 480, y: 345 });
    setPlayerFacing("right");
    setIsGameCompletedOpen(false);

    // Fresh customers for the day (exactly matching today's goal count)
    const freshCustomers = createInitialCustomers(fullInventory, DEFAULT_GOALS[0]?.target || 3);
    customersRef.current = freshCustomers;
    setCustomers(freshCustomers);
    activeCustomerRef.current = null;
    setActiveCustomer(null);
    try { marketAudio.playBell(); } catch (e) {}
  };

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden bg-[#120d18] select-none"
      tabIndex={0}
      autoFocus
      onKeyDown={(e) => {
        const key = e.key ? e.key.toLowerCase() : "";
        const code = e.code || "";
        if (key === "e" || code === "KeyE" || key === " " || code === "Space" || key === "enter" || code === "Enter") {
          e.preventDefault();
          triggerInteraction();
        }
      }}
    >
      
      {/* Full-width Supermarket extending from left to right */}
      <div className="relative w-full h-full select-none bg-[#fae5b6] overflow-hidden">
        
        {/* 1. TOP HUD (Back, Logo, Money on Left; Goals, Sound, Restart on Right) */}
        <MarketHUD
          coins={salesEarned}
          goals={goals}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            marketAudio.setMuted(next);
          }}
          onRestartDay={handleRestartDay}
        />

        {/* 2. MAIN 2D GAME CANVAS AREA */}
        <main className="absolute inset-0 w-full h-full overflow-hidden">
          <MarketCanvas
            layout={layout}
            playerPos={playerPos}
            playerFacing={playerFacing}
            playerMoving={playerMoving}
            playerFrame={playerFrame}
            carryingItem={carryingItem}
            inventory={inventory}
            customers={customers}
            activeCustomer={activeCustomer}
            nearbyInteractable={nearbyInteractable}
            onInteract={triggerInteraction}
            onOpenShelfModal={(category) => {
              setSelectedShelfCategory(category);
              setIsShelfDetailOpen(true);
            }}
          />

          {/* 3. VIRTUAL CONTROLS (Joystick on Left, Action button on Right) */}
          <VirtualControls
            onDirectionChange={(dx, dy) => {
              joystickDir.current = { x: dx, y: dy };
            }}
            onInteract={triggerInteraction}
            canInteract={Boolean(nearbyInteractable)}
            interactLabel={nearbyInteractable?.type === "checkout" ? "CHECKOUT" : nearbyInteractable?.type === "storage" ? "RESTOCK" : "INSPECT"}
          />
        </main>

        {/* 4. COMPACT POS CHECKOUT COMPUTER POPUP */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          customer={activeCustomer}
          onProcessPayment={handleProcessPayment}
          marketAudio={marketAudio}
        />

        {/* 5. STOCKROOM INVENTORY MODAL */}
        <RestockModal
          isOpen={isRestockOpen}
          onClose={() => setIsRestockOpen(false)}
          inventory={inventory}
          onRestockItem={handleRestockShelf}
          marketAudio={marketAudio}
        />

        {/* 6. SHELF DETAIL MODAL */}
        <ShelfDetailModal
          isOpen={isShelfDetailOpen}
          onClose={() => setIsShelfDetailOpen(false)}
          initialCategory={selectedShelfCategory}
          inventory={inventory}
          onRestockItem={handleRestockShelf}
        />

        {/* 7. GAME COMPLETION SUMMARY SCREEN */}
        <DaySummaryModal
          isOpen={isGameCompletedOpen}
          stats={dailyStats}
          onNextDay={handleRestartDay}
          onReturnToMap={() => {
            window.location.href = "/world";
          }}
        />

      </div>
    </div>
  );
}

function checkOverlap(b1, b2) {
  return (
    b1.x < b2.x + b2.w &&
    b1.x + b1.w > b2.x &&
    b1.y < b2.y + b2.h &&
    b1.y + b1.h > b2.y
  );
}

function getDistToRect(px, py, rx, ry, rw, rh) {
  const cx = Math.max(rx, Math.min(px, rx + rw));
  const cy = Math.max(ry, Math.min(py, ry + rh));
  return Math.hypot(px - cx, py - cy);
}
