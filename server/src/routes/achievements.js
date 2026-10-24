const express = require("express");
const authMiddleware = require("../middleware/auth");
const Save = require("../models/Save");
const {
  BADGE_DEFINITIONS,
  processGameplayEvent,
  normalizeAchievements,
} = require("../services/achievementService");

const router = express.Router();

// GET /api/achievements/definitions - Retrieve all available badge definitions
router.get("/definitions", (req, res) => {
  return res.json({
    badges: BADGE_DEFINITIONS,
    total: BADGE_DEFINITIONS.length,
  });
});

// GET /api/achievements - Retrieve authenticated player's achievements & stats
router.get("/", authMiddleware, async (req, res) => {
  try {
    const save = await Save.findOne({ userId: req.user.userId }).lean();
    const achievements = normalizeAchievements(save?.state?.achievements);

    return res.json({
      achievements,
      unlockedCount: achievements.unlockedBadges.length,
      totalCount: BADGE_DEFINITIONS.length,
    });
  } catch (error) {
    console.error("[Get Achievements Error]:", error);
    return res.status(500).json({ error: "Failed to load achievements." });
  }
});

// POST /api/achievements/event - Authoritatively evaluate a gameplay event
router.post("/event", authMiddleware, async (req, res) => {
  try {
    const { type, eventId, payload } = req.body;

    if (!type || typeof type !== "string") {
      return res.status(400).json({ error: "Missing or invalid event 'type'." });
    }

    let save = await Save.findOne({ userId: req.user.userId });
    if (!save) {
      save = await Save.create({
        userId: req.user.userId,
        day: 1,
        schemaVersion: 1,
        state: {
          level: 1,
          xp: 0,
          coins: 250,
          day: 1,
          badges: [],
          achievements: normalizeAchievements(null),
        },
        worldProgress: {},
      });
    }

    const state = save.state || {};
    const currentAchievements = normalizeAchievements(state.achievements);

    const { nextAchievements, newlyUnlocked, xpAwarded } = processGameplayEvent(
      currentAchievements,
      { type, eventId, payload }
    );

    state.achievements = nextAchievements;

    if (newlyUnlocked.length > 0) {
      // Award XP idempotently
      state.xp = (state.xp || 0) + xpAwarded;
      state.level = Math.floor(state.xp / 100) + 1;

      // Keep legacy badges array in sync
      const currentBadges = Array.isArray(state.badges) ? state.badges : [];
      const newBadgeIds = newlyUnlocked.map((b) => b.id);
      const mergedBadges = Array.from(new Set([...currentBadges, ...newBadgeIds]));
      state.badges = mergedBadges;
    }

    save.state = state;
    save.updatedAt = new Date();
    save.markModified("state");
    await save.save();

    return res.json({
      success: true,
      newlyUnlocked,
      xpAwarded,
      achievements: nextAchievements,
      player: {
        xp: state.xp,
        level: state.level,
        coins: state.coins,
        badges: state.badges,
      },
    });
  } catch (error) {
    console.error("[Process Achievement Event Error]:", error);
    return res.status(500).json({ error: "Failed to evaluate gameplay event." });
  }
});

module.exports = router;
