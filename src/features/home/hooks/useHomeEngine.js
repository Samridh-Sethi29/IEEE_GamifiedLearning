import { useState, useEffect, useCallback, useRef } from "react";
import { HOME_MAP, STATIONS, COLLISIONS } from "../data/homeData";

const ACCEL = 0.72;
const MAX_SPEED = 6;
const FRICTION = 0.88;
const AVATAR_W = 48;
const AVATAR_H = 72;
const INTERACT_DIST = 110;

const CAMERA_SMOOTHING_MS = 190;
const CAMERA_SNAP_EPSILON = 0.04;
const CAMERA_STATE_PUBLISH_EPSILON = 1.25;
const VELOCITY_PUBLISH_EPSILON = 0.04;
const STOP_EPSILON = 0.05;
const FRAME_MS = 1000 / 60;
const MAX_FRAME_SCALE = 2.5;

const MOVE_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "w",
  "a",
  "s",
  "d",
]);

const TOUCH_KEYS = {
  up: "w",
  down: "s",
  left: "a",
  right: "d",
};

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function hasMovementInput(keys) {
  return (
    keys.arrowup ||
    keys.arrowdown ||
    keys.arrowleft ||
    keys.arrowright ||
    keys.w ||
    keys.a ||
    keys.s ||
    keys.d
  );
}

function readLocalStorage(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;

    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

function writeLocalStorage(key, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  } catch (error) {
    console.warn("Home World storage error:", error);
  }
}

export function useHomeEngine(viewportRef, cameraElementRef = null) {
  const [pos, setPos] = useState({ x: 600, y: 450 });
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0 });
  const [nearbyStation, setNearbyStation] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  const [completedGames, setCompletedGames] = useState(() => {
    try {
      const saved = readLocalStorage("skillverse_home_progress", "[]");

      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [direction, setDirection] = useState("down");

  const [showWelcome, setShowWelcome] = useState(
    () => readLocalStorage("skillverse_home_welcomed", null) === null,
  );

  // Refs keep the animation loop independent of React render timing.
  const keysRef = useRef({});
  const posRef = useRef({ x: 600, y: 450 });
  const velRef = useRef({ vx: 0, vy: 0 });
  const camRef = useRef({ x: 0, y: 0 });

  const publishedCamRef = useRef({ x: 0, y: 0 });
  const publishedVelocityRef = useRef({ vx: 0, vy: 0 });

  const directionRef = useRef("down");
  const nearbyStationRef = useRef(null);

  const frameRef = useRef(null);
  const wakeLoopRef = useRef(null);

  // Keep the station ref synchronized with the latest committed state.
  // The physics loop and teleport function own posRef.
  nearbyStationRef.current = nearbyStation;

  // Persist completed games.
  useEffect(() => {
    writeLocalStorage(
      "skillverse_home_progress",
      JSON.stringify(completedGames),
    );
  }, [completedGames]);

  // ------------------------------------------------------------
  // Physics and camera animation loop.
  // The loop sleeps when movement and camera settling are finished.
  // ------------------------------------------------------------
  useEffect(() => {
    if (activeGame) {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
      wakeLoopRef.current = null;

      return undefined;
    }

    let disposed = false;
    let framePending = false;
    let lastTimestamp = null;

    // Configure the camera layer for GPU-friendly transforms.
    if (cameraElementRef?.current) {
      const cameraElement = cameraElementRef.current;

      cameraElement.style.willChange = "transform";
      cameraElement.style.backfaceVisibility = "hidden";
      cameraElement.style.transition = "none";

      cameraElement.style.transform = `translate3d(${camRef.current.x}px, ${camRef.current.y}px, 0)`;
    }

    const requestNextFrame = () => {
      if (disposed || framePending) return;

      framePending = true;
      frameRef.current = requestAnimationFrame(tick);
    };

    const tick = (timestamp) => {
      framePending = false;
      frameRef.current = null;

      if (disposed) return;

      // Frame-rate-aware motion with a cap for background-tab pauses.
      const elapsedMs =
        lastTimestamp === null
          ? FRAME_MS
          : Math.max(0, timestamp - lastTimestamp);

      const frameScale = Math.min(MAX_FRAME_SCALE, elapsedMs / FRAME_MS);

      // Limit camera damping time after a dropped frame.
      const cameraDeltaMs = Math.min(50, elapsedMs);

      lastTimestamp = timestamp;

      const keys = keysRef.current;

      let targetDx = 0;
      let targetDy = 0;

      if (keys.arrowup || keys.w) targetDy -= 1;
      if (keys.arrowdown || keys.s) targetDy += 1;
      if (keys.arrowleft || keys.a) targetDx -= 1;
      if (keys.arrowright || keys.d) targetDx += 1;

      // Normalize diagonal movement.
      if (targetDx !== 0 && targetDy !== 0) {
        targetDx *= Math.SQRT1_2;
        targetDy *= Math.SQRT1_2;
      }

      const targetVx = targetDx * MAX_SPEED;
      const targetVy = targetDy * MAX_SPEED;

      let { vx, vy } = velRef.current;

      // Frame-rate-adjusted acceleration and friction.
      const accelFactor = 1 - Math.pow(1 - ACCEL, frameScale);
      const frictionFactor = Math.pow(FRICTION, frameScale);

      if (targetDx !== 0) {
        vx += (targetVx - vx) * accelFactor;
      } else {
        vx *= frictionFactor;

        if (Math.abs(vx) < STOP_EPSILON) {
          vx = 0;
        }
      }

      if (targetDy !== 0) {
        vy += (targetVy - vy) * accelFactor;
      } else {
        vy *= frictionFactor;

        if (Math.abs(vy) < STOP_EPSILON) {
          vy = 0;
        }
      }

      velRef.current = { vx, vy };

      // Update direction only when it changes.
      let nextDirection = directionRef.current;

      if (Math.abs(vx) > 0.3 || Math.abs(vy) > 0.3) {
        if (Math.abs(vx) > Math.abs(vy)) {
          nextDirection = vx > 0 ? "right" : "left";
        } else {
          nextDirection = vy > 0 ? "down" : "up";
        }
      }

      if (nextDirection !== directionRef.current) {
        directionRef.current = nextDirection;
        setDirection(nextDirection);
      }

      const current = posRef.current;

      // Avatar's foot collision rectangle.
      const FOOT_X = 14;
      const FOOT_Y = 54;
      const FOOT_W = 20;
      const FOOT_H = 16;

      // Move on X axis, allowing wall-sliding.
      let nextX = current.x + vx * frameScale;

      nextX = Math.max(20, Math.min(HOME_MAP.width - AVATAR_W - 20, nextX));

      for (const collision of COLLISIONS) {
        if (
          rectsOverlap(
            nextX + FOOT_X,
            current.y + FOOT_Y,
            FOOT_W,
            FOOT_H,
            collision.x,
            collision.y,
            collision.w,
            collision.h,
          )
        ) {
          velRef.current.vx = 0;
          nextX = current.x;
          break;
        }
      }

      // Move on Y axis.
      let nextY = current.y + vy * frameScale;

      nextY = Math.max(20, Math.min(HOME_MAP.height - AVATAR_H - 20, nextY));

      for (const collision of COLLISIONS) {
        if (
          rectsOverlap(
            nextX + FOOT_X,
            nextY + FOOT_Y,
            FOOT_W,
            FOOT_H,
            collision.x,
            collision.y,
            collision.w,
            collision.h,
          )
        ) {
          velRef.current.vy = 0;
          nextY = current.y;
          break;
        }
      }

      const nextPos = { x: nextX, y: nextY };

      const positionChanged =
        Math.abs(nextX - current.x) > 0.001 ||
        Math.abs(nextY - current.y) > 0.001;

      // Keep the physics ref current immediately.
      posRef.current = nextPos;

      // Publish velocity only when it changes meaningfully.
      const actualVelocity = velRef.current;
      const publishedVelocity = publishedVelocityRef.current;

      if (
        Math.abs(actualVelocity.vx - publishedVelocity.vx) >=
          VELOCITY_PUBLISH_EPSILON ||
        Math.abs(actualVelocity.vy - publishedVelocity.vy) >=
          VELOCITY_PUBLISH_EPSILON
      ) {
        const nextVelocity = {
          vx: actualVelocity.vx,
          vy: actualVelocity.vy,
        };

        publishedVelocityRef.current = nextVelocity;
        setVelocity(nextVelocity);
      }

      // ----------------------------------------------------------
      // Smooth camera follow.
      // Directly update the camera element every animation frame,
      // avoiding a React render delay for the visible camera.
      // ----------------------------------------------------------
      let cameraSettling = false;
      let nextCam = null;

      if (viewportRef.current) {
        const viewportWidth = viewportRef.current.clientWidth;
        const viewportHeight = viewportRef.current.clientHeight;

        let targetCamX = -(nextX + AVATAR_W / 2 - viewportWidth / 2);

        let targetCamY = -(nextY + AVATAR_H / 2 - viewportHeight / 2);

        targetCamX = Math.min(
          0,
          Math.max(-(HOME_MAP.width - viewportWidth), targetCamX),
        );

        targetCamY = Math.min(
          0,
          Math.max(-(HOME_MAP.height - viewportHeight), targetCamY),
        );

        const currentCam = camRef.current;

        // Time-based exponential damping gives consistent follow
        // across 60 Hz, 120 Hz, and other display refresh rates.
        const cameraAlpha =
          cameraDeltaMs <= 0
            ? 0
            : 1 - Math.exp(-cameraDeltaMs / CAMERA_SMOOTHING_MS);

        let newCamX = currentCam.x + (targetCamX - currentCam.x) * cameraAlpha;

        let newCamY = currentCam.y + (targetCamY - currentCam.y) * cameraAlpha;

        // Snap only when essentially aligned with the target.
        if (Math.abs(targetCamX - newCamX) < CAMERA_SNAP_EPSILON) {
          newCamX = targetCamX;
        }

        if (Math.abs(targetCamY - newCamY) < CAMERA_SNAP_EPSILON) {
          newCamY = targetCamY;
        }

        camRef.current = {
          x: newCamX,
          y: newCamY,
        };

        cameraSettling =
          Math.abs(newCamX - targetCamX) >= CAMERA_SNAP_EPSILON ||
          Math.abs(newCamY - targetCamY) >= CAMERA_SNAP_EPSILON;

        // Fast rendering path: move the camera without waiting for
        // React to commit another render.
        const cameraElement = cameraElementRef?.current;

        if (cameraElement) {
          cameraElement.style.transform = `translate3d(${newCamX}px, ${newCamY}px, 0)`;
        }

        // React camera state is still available for the minimap,
        // but updates less frequently than the visual transform.
        const publishedCam = publishedCamRef.current;

        const publishCam =
          !cameraElement ||
          Math.abs(newCamX - publishedCam.x) >= CAMERA_STATE_PUBLISH_EPSILON ||
          Math.abs(newCamY - publishedCam.y) >= CAMERA_STATE_PUBLISH_EPSILON;

        if (
          publishCam &&
          (newCamX !== publishedCam.x || newCamY !== publishedCam.y)
        ) {
          nextCam = { x: newCamX, y: newCamY };
          publishedCamRef.current = nextCam;
        }
      }

      // React owns gameplay state; only the camera transform bypasses it.
      if (positionChanged) {
        setPos(nextPos);
      }

      if (nextCam) {
        setCam(nextCam);
      }

      const stillMoving =
        Math.abs(velRef.current.vx) > STOP_EPSILON ||
        Math.abs(velRef.current.vy) > STOP_EPSILON;

      // Sleep when the avatar and camera are completely idle.
      if (hasMovementInput(keysRef.current) || stillMoving || cameraSettling) {
        requestNextFrame();
      } else {
        lastTimestamp = null;
      }
    };

    wakeLoopRef.current = requestNextFrame;

    const handleResize = () => {
      requestNextFrame();
    };

    window.addEventListener("resize", handleResize);

    // Initial frame aligns the camera to the viewport.
    requestNextFrame();

    return () => {
      disposed = true;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = null;
      framePending = false;

      window.removeEventListener("resize", handleResize);

      if (wakeLoopRef.current === requestNextFrame) {
        wakeLoopRef.current = null;
      }
    };
  }, [activeGame, viewportRef, cameraElementRef]);

  // ------------------------------------------------------------
  // Stable keyboard listeners.
  // ------------------------------------------------------------
  useEffect(() => {
    if (activeGame) {
      keysRef.current = {};
      return undefined;
    }

    const handleDown = (event) => {
      const key = event.key.toLowerCase();

      if (MOVE_KEYS.has(key)) {
        // Don't hijack keyboard input in editable controls.
        const target = event.target;
        const tag = target?.tagName?.toLowerCase();

        const isEditable =
          target?.isContentEditable ||
          ["input", "textarea", "select"].includes(tag);

        if (!isEditable) {
          event.preventDefault();
          keysRef.current[key] = true;
          wakeLoopRef.current?.();
        }
      }

      if (key === "e" && nearbyStationRef.current) {
        setActiveGame(nearbyStationRef.current.game);
      }
    };

    const handleUp = (event) => {
      keysRef.current[event.key.toLowerCase()] = false;
      wakeLoopRef.current?.();
    };

    const handleBlur = () => {
      keysRef.current = {};
      wakeLoopRef.current?.();
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", handleBlur);

      keysRef.current = {};
    };
  }, [activeGame]);

  // ------------------------------------------------------------
  // Detect the nearest learning station.
  // Squared distances avoid unnecessary square roots.
  // ------------------------------------------------------------
  useEffect(() => {
    const avatarCX = pos.x + AVATAR_W / 2;
    const avatarCY = pos.y + AVATAR_H / 2;

    const maxDistanceSquared = INTERACT_DIST * INTERACT_DIST;

    let closest = null;
    let closestDistanceSquared = maxDistanceSquared;

    for (const station of STATIONS) {
      const dx = station.x - avatarCX;
      const dy = station.y - avatarCY;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared < closestDistanceSquared) {
        closest = station;
        closestDistanceSquared = distanceSquared;
      }
    }

    setNearbyStation((previous) =>
      previous?.id === closest?.id ? previous : closest,
    );
  }, [pos]);

  // ------------------------------------------------------------
  // Game state helpers.
  // ------------------------------------------------------------
  const completeGame = useCallback((gameId) => {
    setCompletedGames((previous) =>
      previous.includes(gameId) ? previous : [...previous, gameId],
    );
  }, []);

  const closeGame = useCallback(() => {
    setActiveGame(null);
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    writeLocalStorage("skillverse_home_welcomed", "true");
  }, []);

  // ------------------------------------------------------------
  // Touch controls.
  // ------------------------------------------------------------
  const startTouch = useCallback((directionName) => {
    const key = TOUCH_KEYS[directionName];

    if (!key) return;

    keysRef.current[key] = true;
    wakeLoopRef.current?.();
  }, []);

  const endTouch = useCallback((directionName) => {
    const key = TOUCH_KEYS[directionName];

    if (!key) return;

    keysRef.current[key] = false;
    wakeLoopRef.current?.();
  }, []);

  // ------------------------------------------------------------
  // Teleport avatar to a selected location.
  // ------------------------------------------------------------
  const teleport = useCallback((x, y) => {
    const nextPos = {
      x: Math.max(20, Math.min(HOME_MAP.width - AVATAR_W - 20, x)),
      y: Math.max(20, Math.min(HOME_MAP.height - AVATAR_H - 20, y)),
    };

    velRef.current = { vx: 0, vy: 0 };

    publishedVelocityRef.current = {
      vx: 0,
      vy: 0,
    };

    setVelocity({ vx: 0, vy: 0 });

    posRef.current = nextPos;
    setPos(nextPos);

    wakeLoopRef.current?.();
  }, []);

  const speed = Math.hypot(velocity.vx, velocity.vy);

  return {
    pos,
    cam,
    direction,
    velocity,
    speed,
    isWalking: speed > 0.2,
    nearbyStation,
    activeGame,
    completedGames,
    showWelcome,
    setActiveGame,
    closeGame,
    completeGame,
    dismissWelcome,
    startTouch,
    endTouch,
    teleport,
  };
}
