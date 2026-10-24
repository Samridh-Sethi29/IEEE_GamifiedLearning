# 🌾 SkillVerse World Progress Integration Guide

This guide explains how world leads (Home, School, Farm, Market, Marketing) can add custom game progress, scores, and unlocked flags to the shared cloud save system without touching backend models or the main day loop.

---

## 💡 Key Principles

1. **Shared State vs. World Progress:**
   - **Shared State (`usePlayer`)**: Core progression metrics that ripple across worlds (`coins`, `xp`, `day`, `water`, `skills`, and cross-world consequence `flags`).
   - **World Progress (`worldProgress`)**: World-specific detailed data (e.g. mini-game levels completed, item inventories, high scores, puzzle solutions).

2. **When Does It Save to the Cloud?**
   - Saves happen **ONLY at the end of each day cycle** when the reflection screen finishes.
   - Any progress you set using `saveManager.setWorldProgress()` is immediately safely written to `localStorage` and automatically bundled into the cloud sync at night.

---

## 🛠️ Step-by-Step Code Examples

### 1. Saving Progress in Your World Component

Import `saveManager` and call `setWorldProgress(worldKey, progressObject)`:

```jsx
import saveManager from "@/services/saveManager";

export default function FarmMiniGame() {
  const onHarvestComplete = (results) => {
    // Save progress specific to Farm
    saveManager.setWorldProgress("farm", {
      completed: true,
      lastScore: results.score,
      bestScore: 450,
      unlockedSeeds: ["wheat", "corn", "tomatoes"],
      waterEfficiencyPct: 92,
    });
  };

  return (
    <button onClick={() => onHarvestComplete({ score: 450, efficiency: 92 })}>
      Complete Harvest
    </button>
  );
}
```

### 2. Reading Your World's Progress

To load past records or unlocked features when your world component mounts:

```jsx
import { useState, useEffect } from "react";
import saveManager from "@/services/saveManager";

export default function MarketStall() {
  const [marketData, setMarketData] = useState({});

  useEffect(() => {
    const allProgress = saveManager.getWorldProgress();
    const stallData = allProgress.market || {};
    setMarketData(stallData);
  }, []);

  return (
    <div>
      <h3>Market Level: {marketData.level || 1}</h3>
      <p>Items Sold: {marketData.itemsSold || 0}</p>
    </div>
  );
}
```

### 3. Cross-World Consequence Flags

If an action in your world affects other worlds (e.g. repairing a leaking pipe in Home increases water for Farm, or a good farm harvest adds produce to Market):
- Use `usePlayer().updatePlayer({ flags: { ... } })` for cross-world consequence flags.
- Use `saveManager.setWorldProgress("worldKey", { ... })` for world-specific detailed telemetry.

Example:
```jsx
const { updatePlayer } = usePlayer();

// In Home World:
updatePlayer({
  flags: { home_leak_repaired: true },
  water: player.water + 20
});

// Record Home-specific mini-game detail:
saveManager.setWorldProgress("home", {
  pipeFixTimeSeconds: 42,
  toolUsed: "wrench"
});
```

---

## 📦 What the Stored Save Looks Like in MongoDB

```json
{
  "_id": "67b40a...",
  "userId": "67b409...",
  "schemaVersion": 1,
  "day": 2,
  "state": {
    "coins": 250,
    "xp": 90,
    "level": 1,
    "day": 2,
    "water": 100,
    "sustainability": 85,
    "skills": {
      "life": 15,
      "human": 10,
      "digital": 25,
      "vocational": 10,
      "entrepreneurial": 5
    },
    "flags": {
      "home_leak_repaired": true,
      "farmWaterEfficiencyPct": 92
    }
  },
  "worldProgress": {
    "home": {
      "pipeFixTimeSeconds": 42
    },
    "farm": {
      "cropsHarvested": 14,
      "bestScore": 450
    },
    "market": {
      "negotiationWon": true
    }
  },
  "updatedAt": "2026-10-18T10:45:00.000Z"
}
```

---

## 🛡️ Reliability Guarantees
- If a child is playing on a spotty school Wi-Fi connection, `saveManager` queues saves automatically in `localStorage`.
- Progress is never blocked or lost if the server is unreachable.
- When connection returns or on next day end, pending progress automatically flushes to the cloud.
