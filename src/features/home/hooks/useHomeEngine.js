import { useState, useEffect, useCallback, useRef } from 'react';
import { HOME_MAP, STATIONS, COLLISIONS } from '../data/homeData';

const SPEED = 4;
const AVATAR_W = 48;
const AVATAR_H = 72;
const INTERACT_DIST = 100;

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function useHomeEngine(viewportRef) {
  const [pos, setPos] = useState({ x: 600, y: 450 });
  const [cam, setCam] = useState({ x: 0, y: 0 });
  const [nearbyStation, setNearbyStation] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [completedGames, setCompletedGames] = useState(() => {
    try {
      const saved = localStorage.getItem('skillverse_home_progress');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isWalking, setIsWalking] = useState(false);
  const [direction, setDirection] = useState('down');
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('skillverse_home_welcomed');
  });

  const keysRef = useRef({});
  const posRef = useRef(pos);
  const frameRef = useRef(null);
  const walkTimerRef = useRef(null);

  posRef.current = pos;

  // Save completed games
  useEffect(() => {
    localStorage.setItem('skillverse_home_progress', JSON.stringify(completedGames));
  }, [completedGames]);

  // Keyboard events
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

  // Movement loop
  useEffect(() => {
    if (activeGame) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const tick = () => {
      const keys = keysRef.current;
      let dx = 0, dy = 0;

      if (keys['arrowup'] || keys['w']) dy = -SPEED;
      if (keys['arrowdown'] || keys['s']) dy = SPEED;
      if (keys['arrowleft'] || keys['a']) dx = -SPEED;
      if (keys['arrowright'] || keys['d']) dx = SPEED;

      // Normalize diagonal
      if (dx && dy) {
        const f = 0.707;
        dx *= f;
        dy *= f;
      }

      if (dx || dy) {
        // Direction
        if (Math.abs(dx) > Math.abs(dy)) {
          setDirection(dx > 0 ? 'right' : 'left');
        } else {
          setDirection(dy > 0 ? 'down' : 'up');
        }

        const cur = posRef.current;
        let nx = cur.x + dx;
        let ny = cur.y + dy;

        // Clamp to world
        nx = Math.max(30, Math.min(HOME_MAP.width - AVATAR_W - 30, nx));
        ny = Math.max(30, Math.min(HOME_MAP.height - AVATAR_H - 30, ny));

        // Collision check
        let blocked = false;
        for (const c of COLLISIONS) {
          if (rectsOverlap(nx, ny, AVATAR_W, AVATAR_H, c.x, c.y, c.w, c.h)) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          setPos({ x: nx, y: ny });
          setIsWalking(true);
          clearTimeout(walkTimerRef.current);
          walkTimerRef.current = setTimeout(() => setIsWalking(false), 150);
        }
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(walkTimerRef.current);
    };
  }, [activeGame]);

  // Camera follow
  useEffect(() => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth;
    const vh = viewportRef.current.clientHeight;

    let cx = -(pos.x + AVATAR_W / 2 - vw / 2);
    let cy = -(pos.y + AVATAR_H / 2 - vh / 2);

    // Clamp camera
    cx = Math.min(0, Math.max(-(HOME_MAP.width - vw), cx));
    cy = Math.min(0, Math.max(-(HOME_MAP.height - vh), cy));

    setCam({ x: cx, y: cy });
  }, [pos, viewportRef]);

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
    setCompletedGames(prev => {
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
    setPos({ x, y });
  }, []);

  return {
    pos, cam, direction, isWalking,
    nearbyStation, activeGame, completedGames,
    showWelcome,
    setActiveGame, closeGame, completeGame,
    dismissWelcome,
    startTouch, endTouch,
    teleport,
  };
}
