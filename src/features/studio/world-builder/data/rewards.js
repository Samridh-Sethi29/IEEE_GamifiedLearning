// Authoritative reward definitions for "Save Our Village" World Builder mission.
// Approved for Phase D3.5B: 200 XP + 50 Coins + "Village Hydrologist" Badge.
// Pure data: zero dependencies, zero side-effects.

export const MISSION_REWARDS = Object.freeze({
  missionId: "save-our-village",
  xp: 200,
  coins: 50,
  badge: "Village Hydrologist",
  flagKey: "mission_world_builder_save_our_village_completed",
  completedAtKey: "mission_world_builder_save_our_village_completed_at",
});

/**
 * Returns the authoritative mission rewards.
 * @returns {typeof MISSION_REWARDS}
 */
export function getMissionRewards() {
  return MISSION_REWARDS;
}
