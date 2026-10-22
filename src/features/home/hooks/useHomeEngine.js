import { useState, useEffect, useCallback, useRef } from 'react';
import { HOME_MAP, STATIONS, COLLISIONS } from '../data/homeData';

const ACCEL = 0.72;
const MAX_SPEED = 6.0;
const FRICTION = 0.88;
const AVATAR_W = 48;
const AVATAR_H = 72;
const INTERACT_DIST = 110;

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function useHomeEngine(viewportRef) {
  const [pos, setPos] = useState({ x: 600, y: 450 });
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0 });
  const [nearbyStation, setNearbyStation] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [completedGames, setCompletedGames] = useState(() => {
    try {
      const saved = localStorage.getItem('skillverse_home_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [direction, setDirection] = useState('down');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('skillverse_home_welcomed');
  });

  const keysRef = useRef({});
  const posRef = useRef(pos);
  const velRef = useRef({ vx: 0, vy: 0 });
  const camRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);

  posRef.current = pos;

  // Persist completed games
  useEffect(() => {
    try {
      localStorage.setItem('skillverse_home_progress', JSON.stringify(completedGames));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [completedGames]);

  // Keyboard controls
  useEffect(() => {
    if (activeGame) return;

    const handleDown = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
      if (key === 'e' && nearbyStation) {
        setActiveGame(nearbyStation.game);
      }
    };

    const handleUp = (e) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = false;
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      keysRef.current = {};
    };
  }, [activeGame, nearbyStation]);

  // Gliding Physics & Camera LERP Loop
  useEffect(() => {
    if (activeGame) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const tick = () => {
      const keys = keysRef.current;
      let targetDx = 0;
      let targetDy = 0;

      if (keys['arrowup'] || keys['w']) targetDy -= 1;
      if (keys['arrowdown'] || keys['s']) targetDy += 1;
      if (keys['arrowleft'] || keys['a']) targetDx -= 1;
      if (keys['arrowright'] || keys['d']) targetDx += 1;

      // Normalize diagonal intent
      if (targetDx !== 0 && targetDy !== 0) {
        targetDx *= 0.7071;
        targetDy *= 0.7071;
      }

      const targetVx = targetDx * MAX_SPEED;
      const targetVy = targetDy * MAX_SPEED;

      let { vx, vy } = velRef.current;

      // Smooth acceleration when steering, smooth gliding friction when released
      if (targetDx !== 0) {
        vx += (targetVx - vx) * ACCEL;
      } else {
        vx *= FRICTION;
        if (Math.abs(vx) < 0.05) vx = 0;
      }

      if (targetDy !== 0) {
        vy += (targetVy - vy) * ACCEL;
      } else {
        vy *= FRICTION;
        if (Math.abs(vy) < 0.05) vy = 0;
      }

      velRef.current = { vx, vy };

      // Update facing direction when actively moving
      if (Math.abs(vx) > 0.3 || Math.abs(vy) > 0.3) {
        if (Math.abs(vx) > Math.abs(vy)) {
          setDirection(vx > 0 ? 'right' : 'left');
        } else {
          setDirection(vy > 0 ? 'down' : 'up');
        }
      }

      const cur = posRef.current;

      // Top-down character foot collision box (allows natural perspective and easy doorway passage)
      const FOOT_X = 14;
      const FOOT_Y = 54;
      const FOOT_W = 20;
      const FOOT_H = 16;

      // Independent X axis movement with wall-sliding
      let nextX = cur.x + vx;
      nextX = Math.max(20, Math.min(HOME_MAP.width - AVATAR_W - 20, nextX));
      let blockedX = false;
      for (const c of COLLISIONS) {
        if (rectsOverlap(nextX + FOOT_X, cur.y + FOOT_Y, FOOT_W, FOOT_H, c.x, c.y, c.w, c.h)) {
          blockedX = true;
          break;
        }
      }
      if (blockedX) {
        velRef.current.vx = 0;
        nextX = cur.x;
      }

      // Independent Y axis movement with wall-sliding
      let nextY = cur.y + vy;
      nextY = Math.max(20, Math.min(HOME_MAP.height - AVATAR_H - 20, nextY));
      let blockedY = false;
      for (const c of COLLISIONS) {
        if (rectsOverlap(nextX + FOOT_X, nextY + FOOT_Y, FOOT_W, FOOT_H, c.x, c.y, c.w, c.h)) {
          blockedY = true;
          break;
        }
      }
      if (blockedY) {
        velRef.current.vy = 0;
        nextY = cur.y;
      }

      // Update position state if position or speed changed
      if (nextX !== cur.x || nextY !== cur.y || Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
        setPos({ x: nextX, y: nextY });
        setVelocity({ vx: velRef.current.vx, vy: velRef.current.vy });
      }

      // Smooth camera interpolation (LERP) following the avatar
      if (viewportRef.current) {
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;

        let idealCamX = -(nextX + AVATAR_W / 2 - vw / 2);
        let idealCamY = -(nextY + AVATAR_H / 2 - vh / 2);

        idealCamX = Math.min(0, Math.max(-(HOME_MAP.width - vw), idealCamX));
        idealCamY = Math.min(0, Math.max(-(HOME_MAP.height - vh), idealCamY));

        const newCamX = camRef.current.x + (idealCamX - camRef.current.x) * 0.12;
        const newCamY = camRef.current.y + (idealCamY - camRef.current.y) * 0.12;

        camRef.current = { x: newCamX, y: newCamY };
        setCam({ x: newCamX, y: newCamY });
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [activeGame, viewportRef]);

  // Nearby station detection
  useEffect(() => {
    const avatarCX = pos.x + AVATAR_W / 2;
    const avatarCY = pos.y + AVATAR_H / 2;

    let closest = null;
    let closestDist = Infinity;

    for (const station of STATIONS) {
      const dx = station.x - avatarCX;
      const dy = station.y - avatarCY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < INTERACT_DIST && dist < closestDist) {
        closest = station;
        closestDist = dist;
      }
    }

    setNearbyStation(closest);
  }, [pos]);

  const completeGame = useCallback((gameId) => {
    setCompletedGames((prev) => {
      if (prev.includes(gameId)) return prev;
      return [...prev, gameId];
    });
  }, []);

  const closeGame = useCallback(() => {
    setActiveGame(null);
  }, []);

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('skillverse_home_welcomed', 'true');
  }, []);

  // Touch movement helpers
  const startTouch = useCallback((dir) => {
    if (dir === 'up') keysRef.current['w'] = true;
    if (dir === 'down') keysRef.current['s'] = true;
    if (dir === 'left') keysRef.current['a'] = true;
    if (dir === 'right') keysRef.current['d'] = true;
  }, []);

  const endTouch = useCallback((dir) => {
    if (dir === 'up') keysRef.current['w'] = false;
    if (dir === 'down') keysRef.current['s'] = false;
    if (dir === 'left') keysRef.current['a'] = false;
    if (dir === 'right') keysRef.current['d'] = false;
  }, []);

  const teleport = useCallback((x, y) => {
    velRef.current = { vx: 0, vy: 0 };
    setPos({ x, y });
    posRef.current = { x, y };
  }, []);

  const isGliding = Math.hypot(velocity.vx, velocity.vy) > 0.2;
  const speed = Math.hypot(velocity.vx, velocity.vy);

  return {
    pos,
    cam,
    direction,
    velocity,
    speed,
    isWalking: isGliding,
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
