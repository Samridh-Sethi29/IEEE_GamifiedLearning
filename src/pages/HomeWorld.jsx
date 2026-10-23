import React, { useRef, useState, useMemo, useEffect } from "react";

import "@/features/home/styles/home.css";
import { ROOMS, STATIONS, HOME_MAP } from "@/features/home/data/homeData";

import { useHomeEngine } from "@/features/home/hooks/useHomeEngine";
import { usePlayer } from "@/features/player/hooks/usePlayer";

import {
  LivingRoomArt,
  KitchenArt,
  BedroomArt,
  BathroomArt,
  GardenArt,
  SafetyCornerArt,
  DoorwaysArt,
} from "@/features/home/components/HomeRoomArt";

import HomeAvatar from "@/features/home/components/HomeAvatar";
import HomeStationMarker from "@/features/home/components/HomeStationMarker";
import HomeMinimap from "@/features/home/components/HomeMinimap";
import HomeTouchControls from "@/features/home/components/HomeTouchControls";
import HomeWelcomeModal from "@/features/home/components/HomeWelcomeModal";
import HomeHUD from "@/features/home/components/HomeHUD";
import HomeMiniGames from "@/features/home/components/HomeMiniGames";

export default function HomeWorld() {
  const viewportRef = useRef(null);

  // The engine updates this element's transform on animation frames,
  // keeping the visual camera movement independent of React rendering.
  const cameraElementRef = useRef(null);

  const { player, addCoins, earnXP, updateSkill, markWorldCompleted } =
    usePlayer();

  const {
    pos,
    cam,
    direction,
    velocity,
    isWalking,
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
  } = useHomeEngine(viewportRef, cameraElementRef);

  const [helpOpen, setHelpOpen] = useState(false);
  const [rewardToast, setRewardToast] = useState(null);

  // Determine which room the avatar is currently in.
  const currentRoomId = useMemo(() => {
    const rx = Math.floor(pos.x / 1200);
    const ry = Math.floor(pos.y / 900);

    if (ry === 0) {
      if (rx === 0) return "living";
      if (rx === 1) return "kitchen";
      return "garden";
    }

    if (rx === 0) return "bedroom";
    if (rx === 1) return "bathroom";
    return "safety";
  }, [pos.x, pos.y]);

  // Handle earning rewards from mini-games.
  const handleEarnRewards = ({ coins = 0, xp = 0, skill = "life" }) => {
    if (coins > 0) addCoins(coins);
    if (xp > 0) earnXP(xp);
    if (skill) updateSkill(skill, 5);

    setRewardToast(`+${coins} Coins • +${xp} XP!`);

    // Automatically clear the temporary reward message.
    window.setTimeout(() => {
      setRewardToast(null);
    }, 2500);

    // Mark the Home world complete when all stations are done.
    if (completedGames.length + 1 >= STATIONS.length) {
      markWorldCompleted("home");
    }
  };

  // Focus the viewport so keyboard movement works immediately.
  useEffect(() => {
    viewportRef.current?.focus();
  }, []);

  return (
    <div className="home-world">
      {/* HUD: navigation, room name, player statistics and help */}
      <HomeHUD
        currentRoomId={currentRoomId}
        completedGames={completedGames}
        player={player}
        onOpenHelp={() => setHelpOpen(true)}
        onTeleport={teleport}
      />

      {/* Floating reward notification */}
      {rewardToast && (
        <div className="coin-popup" role="status" aria-live="polite">
          <span>✨ {rewardToast}</span>
        </div>
      )}

      {/* Main game viewport */}
      <div
        className="home-viewport"
        ref={viewportRef}
        tabIndex={0}
        style={{ outline: "none" }}
        onClick={() => viewportRef.current?.focus()}
      >
        {/*
          Important:
          Do not set transform here. useHomeEngine updates the camera
          element directly during requestAnimationFrame.
        */}
        <div
          className="home-camera"
          ref={cameraElementRef}
          style={{
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {/* SVG map containing all six rooms and their doorways */}
          <svg
            width={HOME_MAP.width}
            height={HOME_MAP.height}
            viewBox={`0 0 ${HOME_MAP.width} ${HOME_MAP.height}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {/* Top row */}
            <g transform="translate(0, 0)">
              <LivingRoomArt />
            </g>

            <g transform="translate(1200, 0)">
              <KitchenArt />
            </g>

            <g transform="translate(2400, 0)">
              <GardenArt />
            </g>

            {/* Bottom row */}
            <g transform="translate(0, 900)">
              <BedroomArt />
            </g>

            <g transform="translate(1200, 900)">
              <BathroomArt />
            </g>

            <g transform="translate(2400, 900)">
              <SafetyCornerArt />
            </g>

            {/* Connecting doorways and wall openings */}
            <DoorwaysArt />
          </svg>

          {/* Room name labels */}
          {Object.values(ROOMS).map((room) => (
            <div
              key={room.id}
              className="room-label"
              style={{
                left: `${room.x + room.w / 2}px`,
                top: `${room.y + 16}px`,
              }}
            >
              {room.name}
            </div>
          ))}

          {/* Interactive learning stations */}
          {STATIONS.map((station) => (
            <HomeStationMarker
              key={station.id}
              station={station}
              isNearby={nearbyStation?.id === station.id}
              isCompleted={completedGames.includes(station.game)}
              onInteract={() => setActiveGame(station.game)}
            />
          ))}

          {/* Player avatar */}
          <HomeAvatar
            pos={pos}
            velocity={velocity}
            direction={direction}
            isWalking={isWalking}
            nearbyStation={nearbyStation}
            name={player.name}
            level={player.level}
          />
        </div>
      </div>

      {/* Minimap */}
      <HomeMinimap
        pos={pos}
        cam={cam}
        completedGames={completedGames}
        onTeleport={teleport}
      />

      {/* Touch and mobile controls */}
      <HomeTouchControls
        onTouchStart={startTouch}
        onTouchEnd={endTouch}
        nearbyStation={nearbyStation}
        onInteract={() => {
          if (nearbyStation) {
            setActiveGame(nearbyStation.game);
          }
        }}
      />

      {/* Welcome and help dialogs */}
      <HomeWelcomeModal
        isOpen={showWelcome || helpOpen}
        onClose={() => {
          dismissWelcome();
          setHelpOpen(false);
        }}
      />

      {/* Active mini-game */}
      {activeGame && (
        <HomeMiniGames
          gameId={activeGame}
          onClose={closeGame}
          onComplete={completeGame}
          onEarnRewards={handleEarnRewards}
        />
      )}
    </div>
  );
}
