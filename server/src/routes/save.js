const express = require("express");
const Save = require("../models/Save");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB max

// GET /api/save - Retrieve current user's save
router.get("/", authMiddleware, async (req, res) => {
  try {
    const save = await Save.findOne({ userId: req.user.userId }).lean();
    if (!save) {
      return res.status(200).json({
        message: "No existing cloud save found for this user.",
        save: null,
      });
    }

    return res.json({
      save: {
        id: save._id,
        userId: save.userId,
        schemaVersion: save.schemaVersion,
        day: save.day,
        state: save.state,
        worldProgress: save.worldProgress || {},
        updatedAt: save.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Get Save Error]:", error);
    return res.status(500).json({
      error: "Failed to retrieve game save. Please try again.",
    });
  }
});

// PUT /api/save - Upsert user's save with conflict checking
router.put("/", authMiddleware, async (req, res) => {
  try {
    const rawBody = req.body;

    // Check payload size
    const payloadSize = Buffer.byteLength(JSON.stringify(rawBody || {}));
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({
        error: "Save payload is too large. Max size is 256KB.",
      });
    }

    if (!rawBody || typeof rawBody !== "object" || Array.isArray(rawBody)) {
      return res.status(400).json({
        error: "Invalid save payload format.",
      });
    }

    const {
      state,
      worldProgress = {},
      schemaVersion = 1,
      clientUpdatedAt,
      force = false,
    } = rawBody;

    if (!state || typeof state !== "object" || Array.isArray(state)) {
      return res.status(400).json({
        error: "Save payload must include a valid 'state' object.",
      });
    }

    // Determine current day from explicit field or state
    const incomingDay = Number(
      rawBody.day !== undefined ? rawBody.day : state.day || 1
    );

    if (isNaN(incomingDay) || incomingDay < 1) {
      return res.status(400).json({
        error: "Invalid day value in save payload.",
      });
    }

    const existingSave = await Save.findOne({ userId: req.user.userId });

    if (existingSave && !force) {
      // Version / Stale Save Check:
      // 1. If incoming day is strictly less than existing save's day
      if (incomingDay < existingSave.day) {
        return res.status(409).json({
          error: "Cloud save has progress from a later day.",
          conflict: true,
          serverSave: {
            day: existingSave.day,
            schemaVersion: existingSave.schemaVersion,
            updatedAt: existingSave.updatedAt,
            state: existingSave.state,
            worldProgress: existingSave.worldProgress,
          },
        });
      }

      // 2. If same day, check timestamps if client provided one
      if (incomingDay === existingSave.day && clientUpdatedAt) {
        const clientTime = new Date(clientUpdatedAt).getTime();
        const serverTime = new Date(existingSave.updatedAt).getTime();
        if (!isNaN(clientTime) && clientTime < serverTime) {
          return res.status(409).json({
            error: "Cloud save is newer than this local save for Day " + incomingDay,
            conflict: true,
            serverSave: {
              day: existingSave.day,
              schemaVersion: existingSave.schemaVersion,
              updatedAt: existingSave.updatedAt,
              state: existingSave.state,
              worldProgress: existingSave.worldProgress,
            },
          });
        }
      }
    }

    let savedDoc;
    if (existingSave) {
      existingSave.schemaVersion = schemaVersion;
      existingSave.day = incomingDay;
      existingSave.state = state;
      existingSave.worldProgress = worldProgress;
      existingSave.updatedAt = new Date();
      savedDoc = await existingSave.save();
    } else {
      savedDoc = await Save.create({
        userId: req.user.userId,
        schemaVersion,
        day: incomingDay,
        state,
        worldProgress,
        updatedAt: new Date(),
      });
    }

    return res.json({
      message: "Save stored successfully.",
      save: {
        id: savedDoc._id,
        userId: savedDoc.userId,
        schemaVersion: savedDoc.schemaVersion,
        day: savedDoc.day,
        state: savedDoc.state,
        worldProgress: savedDoc.worldProgress,
        updatedAt: savedDoc.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Put Save Error]:", error);
    return res.status(500).json({
      error: "Failed to store game save. Please try again.",
    });
  }
});

module.exports = router;
