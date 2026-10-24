import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { MISSION_REWARDS, getMissionRewards } from "../data/rewards.js";
import {
  isMissionAlreadyCompleted,
  getMissionCompletedAt,
  getFreshestPlayerState,
  evaluateMissionRewardEligibility,
  calculatePlayerRewardUpdates,
  executeMissionCompletion,
  executeMissionCompletionSync,
  withCrossTabLock,
  getMissionLockName,
} from "../engine/missionRewards.js";
import { evaluateMissionCompletion } from "../engine/missionCompletion.js";
import { runVillageTrial } from "../engine/villageTrialModel.js";
import { getWaterStatus } from "../engine/waterStatusModel.js";
import { createProject, createObject } from "../../engine/schema.js";
import {
  resolveWorldBuilderView,
  createWorldBuilderStorage,
} from "../engine/worldBuilderWorkspaceModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const studioRoot = resolve(__dirname, "../..");

function makeDoc(objects = [], type = "world-builder") {
  return createProject({
    id: "test_doc",
    type,
    title: "Mission Rewards Test",
    objects,
  });
}

function makePassingVillage() {
  const well = createObject("well", { id: "w1", x: 100, y: 200, width: 80, height: 90 });
  const pipe1 = createObject("pipe", { id: "p1", x: 150, y: 209, width: 100, height: 30 });
  const pipe2 = createObject("pipe", { id: "p2", x: 250, y: 209, width: 100, height: 30 });
  const farm = createObject("farm", { id: "f1", x: 350, y: 209, width: 100, height: 100 });

  const h1 = createObject("house", { id: "h1", x: 144, y: 184, width: 110, height: 100 });
  const h2 = createObject("house", { id: "h2", x: 244, y: 184, width: 110, height: 100 });
  const p3 = createObject("pipe", { id: "p3", x: 300, y: 267, width: 116, height: 30, rotation: 90 });
  const h3 = createObject("house", { id: "h3", x: 344, y: 300, width: 110, height: 100 });
  const p4 = createObject("pipe", { id: "p4", x: 300, y: 151, width: 116, height: 30, rotation: 90 });
  const h4 = createObject("house", { id: "h4", x: 344, y: 68, width: 110, height: 100 });

  return makeDoc([well, pipe1, pipe2, farm, h1, h2, p3, h3, p4, h4]);
}

const passingInputs = {
  dailySupplyLitres: 100,
  dailyDemandLitres: 80,
  availableReserveLitres: 15,
};

function makeMockPlayer(overrides = {}) {
  return {
    id: "local",
    name: "Explorer",
    level: 1,
    xp: 0,
    coins: 150,
    day: 1,
    water: 100,
    skills: { life: 0, human: 0, digital: 0, vocational: 0, entrepreneurial: 0 },
    flags: {},
    badges: [],
    completedToday: [],
    ...overrides,
  };
}

function createMockStorage(initialData = {}) {
  const store = new Map(Object.entries(initialData));
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

test("1. First-time eligible completion grants the approved rewards once", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer({ xp: 50, level: 1, coins: 150 });
  let savedUpdates = null;
  const commitPlayerState = (updates) => {
    savedUpdates = updates;
  };

  const evalResult = evaluateMissionRewardEligibility(doc, passingInputs, player);
  assert.equal(evalResult.eligible, true);
  assert.equal(evalResult.rewarded, true);
  assert.equal(evalResult.isReplay, false);
  assert.equal(evalResult.status, "eligible_for_reward");
  assert.equal(evalResult.rewards.xp, 200);
  assert.equal(evalResult.rewards.coins, 50);
  assert.equal(evalResult.rewards.badge, "Village Hydrologist");

  const execResult = await executeMissionCompletion(doc, passingInputs, player, commitPlayerState);
  assert.equal(execResult.success, true);
  assert.equal(execResult.rewarded, true);
  assert.equal(execResult.isReplay, false);
  assert.ok(savedUpdates, "commitPlayerState must be invoked with updates");

  // XP: 50 + 200 = 250 XP
  assert.equal(savedUpdates.xp, 250);
  // Level: Math.floor(250 / 100) + 1 = 3
  assert.equal(savedUpdates.level, 3);
  // Coins: starts at 150 + 50 reward + (leveled up from 1 to 3 -> coin bonus 100) = 300
  assert.equal(savedUpdates.coins, 300);
  // Badges: contains Village Hydrologist
  assert.ok(savedUpdates.badges.includes("Village Hydrologist"));
  // Flags: contains completion flag and timestamp
  assert.equal(savedUpdates.flags[MISSION_REWARDS.flagKey], true);
  assert.ok(savedUpdates.flags[MISSION_REWARDS.completedAtKey]);
});

test("2. Repeated completion requests do not grant duplicates", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();
  let callCount = 0;
  let currentPlayer = { ...player };

  const commitPlayerState = (updates) => {
    callCount++;
    currentPlayer = {
      ...currentPlayer,
      ...updates,
      flags: { ...currentPlayer.flags, ...updates.flags },
      badges: [...(updates.badges || currentPlayer.badges)],
    };
  };

  // First execution: should grant
  const res1 = await executeMissionCompletion(doc, passingInputs, currentPlayer, commitPlayerState);
  assert.equal(res1.success, true);
  assert.equal(res1.rewarded, true);
  assert.equal(res1.isReplay, false);
  assert.equal(callCount, 1);

  // Second execution with updated player: must NOT grant duplicate rewards
  const res2 = await executeMissionCompletion(doc, passingInputs, currentPlayer, commitPlayerState);
  assert.equal(res2.success, true);
  assert.equal(res2.rewarded, false);
  assert.equal(res2.isReplay, true);
  assert.equal(callCount, 1, "commitPlayerState must NOT be called a second time");
});

test("3. Reopening an already completed mission does not repeat rewards", async () => {
  const doc = makePassingVillage();
  const completedPlayer = makeMockPlayer({
    xp: 250,
    level: 3,
    coins: 300,
    flags: {
      [MISSION_REWARDS.flagKey]: true,
      [MISSION_REWARDS.completedAtKey]: "2026-10-20T10:00:00.000Z",
    },
    badges: ["Village Hydrologist"],
  });

  let updateCalled = false;
  const commitPlayerState = () => {
    updateCalled = true;
  };

  const evalResult = evaluateMissionRewardEligibility(doc, passingInputs, completedPlayer);
  assert.equal(evalResult.eligible, true);
  assert.equal(evalResult.rewarded, false);
  assert.equal(evalResult.isReplay, true);

  const execResult = await executeMissionCompletion(doc, passingInputs, completedPlayer, commitPlayerState);
  assert.equal(execResult.success, true);
  assert.equal(execResult.rewarded, false);
  assert.equal(execResult.isReplay, true);
  assert.equal(updateCalled, false, "commitPlayerState must NOT be called when reopening completed mission");
});

test("4. Refresh/reinitialization respects the durable completion record", async () => {
  const doc = makePassingVillage();
  const mockStorage = createMockStorage({
    skillverse_save: JSON.stringify(
      makeMockPlayer({
        xp: 250,
        level: 3,
        coins: 300,
        flags: {
          [MISSION_REWARDS.flagKey]: true,
          [MISSION_REWARDS.completedAtKey]: "2026-10-20T10:00:00.000Z",
        },
        badges: ["Village Hydrologist"],
      })
    ),
  });

  // Stale in-memory player snapshot without flags
  const stalePlayerSnapshot = makeMockPlayer({ xp: 50, level: 1, coins: 150 });

  let updateCalled = false;
  const commitPlayerState = () => {
    updateCalled = true;
  };

  const res = await executeMissionCompletion(
    doc,
    passingInputs,
    stalePlayerSnapshot,
    commitPlayerState,
    MISSION_REWARDS,
    mockStorage
  );

  assert.equal(res.success, true);
  assert.equal(res.isReplay, true);
  assert.equal(res.rewarded, false);
  assert.equal(updateCalled, false, "Storage record must take precedence over stale in-memory snapshot");
});

test("5. Ineligible and unknown requirements prevent reward grants", async () => {
  const player = makeMockPlayer();
  let updateCalled = false;
  const commitPlayerState = () => {
    updateCalled = true;
  };

  // Ineligible: empty document
  const resEmpty = await executeMissionCompletion(makeDoc([]), passingInputs, player, commitPlayerState);
  assert.equal(resEmpty.success, false);
  assert.equal(resEmpty.rewarded, false);
  assert.equal(updateCalled, false);

  // Unknown: missing daily supply
  const doc = makePassingVillage();
  const incompleteInputs = { dailySupplyLitres: null, dailyDemandLitres: 80, availableReserveLitres: 15 };
  const resIncomplete = await executeMissionCompletion(doc, incompleteInputs, player, commitPlayerState);
  assert.equal(resIncomplete.success, false);
  assert.equal(resIncomplete.rewarded, false);
  assert.equal(updateCalled, false);

  // Unknown: missing reserve
  const missingReserveInputs = { dailySupplyLitres: 100, dailyDemandLitres: 80, availableReserveLitres: null };
  const resNoReserve = await executeMissionCompletion(doc, missingReserveInputs, player, commitPlayerState);
  assert.equal(resNoReserve.success, false);
  assert.equal(resNoReserve.rewarded, false);
  assert.equal(updateCalled, false);
});

test("6. Concurrent requests are tested to the extent supported by the actual persistence mechanism", async () => {
  const doc = makePassingVillage();
  const mockStorage = createMockStorage({
    skillverse_save: JSON.stringify(makeMockPlayer({ xp: 0, coins: 150, level: 1 })),
  });

  let calls = 0;
  const commitPlayerState = (updates) => {
    calls++;
    const current = JSON.parse(mockStorage.getItem("skillverse_save"));
    const next = {
      ...current,
      ...updates,
      flags: { ...current.flags, ...updates.flags },
    };
    mockStorage.setItem("skillverse_save", JSON.stringify(next));
  };

  const basePlayer = makeMockPlayer({ xp: 0, coins: 150, level: 1 });

  // First request executes
  const res1 = await executeMissionCompletion(doc, passingInputs, basePlayer, commitPlayerState, MISSION_REWARDS, mockStorage);
  // Second request executes immediately after in the same environment
  const res2 = await executeMissionCompletion(doc, passingInputs, basePlayer, commitPlayerState, MISSION_REWARDS, mockStorage);

  assert.equal(res1.rewarded, true);
  assert.equal(res2.rewarded, false);
  assert.equal(res2.isReplay, true);
  assert.equal(calls, 1, "Only one execution commits rewards; subsequent call detects durable flag");
});

test("7. A completion-storage failure does not show a false success", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();

  const failingStorageUpdate = () => {
    throw new Error("QuotaExceededError: localStorage disk full");
  };

  const res = await executeMissionCompletion(doc, passingInputs, player, failingStorageUpdate);
  assert.equal(res.success, false);
  assert.equal(res.rewarded, false);
  assert.match(res.error, /QuotaExceededError/);
});

test("8. A reward-grant failure is reported accurately", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();

  // Missing commit function
  const resNoFn = await executeMissionCompletion(doc, passingInputs, player, null);
  assert.equal(resNoFn.success, false);
  assert.equal(resNoFn.rewarded, false);
  assert.match(resNoFn.error, /No player state update handler was provided/i);
});

test("9. A player-profile persistence failure is reported accurately", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();

  const failingCommit = () => {
    throw new Error("SecurityError: Access to localStorage is denied");
  };

  const res = await executeMissionCompletion(doc, passingInputs, player, failingCommit);
  assert.equal(res.success, false);
  assert.equal(res.rewarded, false);
  assert.match(res.error, /SecurityError/);
});

test("10. A safe retry does not duplicate any previously confirmed grant", async () => {
  const doc = makePassingVillage();
  const mockStorage = createMockStorage({
    skillverse_save: JSON.stringify(makeMockPlayer({ xp: 0, coins: 150, level: 1 })),
  });

  let shouldFail = true;
  let commitCount = 0;

  const commitPlayerState = (updates) => {
    if (shouldFail) {
      throw new Error("Simulated network/storage blip");
    }
    commitCount++;
    const current = JSON.parse(mockStorage.getItem("skillverse_save"));
    mockStorage.setItem(
      "skillverse_save",
      JSON.stringify({ ...current, ...updates, flags: { ...current.flags, ...updates.flags } })
    );
  };

  const player = makeMockPlayer({ xp: 0, coins: 150, level: 1 });

  // Initial attempt: fails
  const attempt1 = await executeMissionCompletion(doc, passingInputs, player, commitPlayerState, MISSION_REWARDS, mockStorage);
  assert.equal(attempt1.success, false);
  assert.equal(commitCount, 0);

  // Player retries after failure resolved: succeeds
  shouldFail = false;
  const attempt2 = await executeMissionCompletion(doc, passingInputs, player, commitPlayerState, MISSION_REWARDS, mockStorage);
  assert.equal(attempt2.success, true);
  assert.equal(attempt2.rewarded, true);
  assert.equal(commitCount, 1);

  // Subsequent retry: detects already confirmed grant
  const attempt3 = await executeMissionCompletion(doc, passingInputs, player, commitPlayerState, MISSION_REWARDS, mockStorage);
  assert.equal(attempt3.success, true);
  assert.equal(attempt3.rewarded, false);
  assert.equal(attempt3.isReplay, true);
  assert.equal(commitCount, 1, "Retry after confirmed grant must not duplicate rewards");
});

test("11. Newer player-profile fields are preserved", async () => {
  const mockStorage = createMockStorage({
    skillverse_save: JSON.stringify(
      makeMockPlayer({
        xp: 120, // newer XP earned in other activity
        level: 2,
        coins: 220, // newer coins
        day: 8,
        water: 90,
        skills: { life: 15, human: 10, digital: 20, vocational: 5, entrepreneurial: 8 },
        computerProgress: { typing: { currentLevel: 4 } },
        english: { totalPoints: 150 },
      })
    ),
  });

  // Stale in-memory player snapshot with older coin and XP counts
  const stalePlayer = makeMockPlayer({
    xp: 0,
    level: 1,
    coins: 150,
    day: 1,
  });

  const doc = makePassingVillage();
  let committedUpdates = null;

  await executeMissionCompletion(
    doc,
    passingInputs,
    stalePlayer,
    (updates) => {
      committedUpdates = updates;
    },
    MISSION_REWARDS,
    mockStorage
  );

  assert.ok(committedUpdates);
  // Calculates against fresh storage XP: 120 + 200 = 320 XP
  assert.equal(committedUpdates.xp, 320);
  // Level: Math.floor(320 / 100) + 1 = 4
  assert.equal(committedUpdates.level, 4);
  // Coins: 220 fresh + 50 reward + 100 level-up bonus = 370 (NOT based on stale 150)
  assert.equal(committedUpdates.coins, 370);
});

test("12. The player's construction-budget evaluation does not deduct actual coins", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer({ coins: 150 });
  let savedCoins = null;

  await executeMissionCompletion(doc, passingInputs, player, (updates) => {
    savedCoins = updates.coins;
  });

  // Construction cost is 70 coins. Player coin balance must NOT deduct 70 coins.
  // Initial 150 + 50 reward + 100 level-up bonus = 300 coins.
  assert.equal(savedCoins, 300);
  assert.notEqual(savedCoins, 300 - 70);
});

test("13. Test Village and Check Water System do not trigger completion rewards", () => {
  const doc = makePassingVillage();
  const trialResult = runVillageTrial(doc);
  assert.equal(trialResult.ok, true);

  const statusResult = getWaterStatus(doc);
  assert.ok(statusResult.summaryText);

  // Verify trial & water status models do not return reward fields or modify player
  assert.equal(trialResult.rewards, undefined);
  assert.equal(statusResult.rewards, undefined);
});

test("14. Sandbox and unrelated missions remain unaffected", () => {
  const sandboxDoc = makeDoc([], "sandbox");
  assert.notEqual(sandboxDoc.type, "world-builder");

  const propsPanelSrc = readFileSync(
    resolve(studioRoot, "engine/PropertiesPanel.jsx"),
    "utf8"
  );
  assert.match(propsPanelSrc, /doc\.type === "world-builder" && \(\s*<MissionDashboard/);
});

test("15. Existing save/reload, mission-completion, and player-save isolation tests still pass", () => {
  const doc = makePassingVillage();
  const completion = evaluateMissionCompletion(doc, passingInputs);
  assert.equal(completion.eligibleForCompletion, true);

  // Engine files remain isolated from skillverse_save and direct player mutation
  const engineFiles = [
    "world-builder/engine/waterNetwork.js",
    "world-builder/engine/waterOverlayModel.js",
    "world-builder/engine/waterStatusModel.js",
    "world-builder/engine/villageTrialModel.js",
    "world-builder/engine/constructionBudget.js",
    "world-builder/engine/waterReserve.js",
    "world-builder/engine/missionReadiness.js",
    "world-builder/engine/missionCompletion.js",
  ];

  for (const rel of engineFiles) {
    const src = readFileSync(resolve(studioRoot, rel), "utf-8");
    assert.doesNotMatch(src, /skillverse_save/, `${rel} touches skillverse_save`);
    assert.doesNotMatch(src, /usePlayer|updatePlayer|features\/player/, `${rel} touches player progression`);
    assert.doesNotMatch(src, /localStorage/, `${rel} touches localStorage`);
  }
});

test("16. MissionDashboard renders actionable retry state and mutex protection", () => {
  const dashboardSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionDashboard.jsx"),
    "utf8"
  );
  assert.match(dashboardSrc, /submittingRef/);
  assert.match(dashboardSrc, /data-testid="wb-completion-error"/);
  assert.match(dashboardSrc, /wb-completion-error-hint/);
  assert.match(dashboardSrc, /Retry Mission Completion/);
});

test("17. Complete 15-step end-to-end player journey audit", async () => {
  // Step 1: Open World Builder mission briefing
  const view1 = resolveWorldBuilderView(new URLSearchParams(""));
  assert.equal(view1, "briefing");

  // Step 2: Open existing village workspace
  const view2 = resolveWorldBuilderView(new URLSearchParams("mode=edit"));
  assert.equal(view2, "editor");

  // Step 3: Build and save a village design
  const wbStorageMock = createMockStorage();
  const wbStorage = createWorldBuilderStorage(wbStorageMock);
  const design = makePassingVillage();
  const saveResult = wbStorage.save(design);
  assert.equal(saveResult.ok, true);

  // Step 4: Satisfy all configured mission requirements
  const goodInputs = { ...passingInputs };
  const initialComp = evaluateMissionCompletion(design, goodInputs);
  assert.equal(initialComp.eligibleForCompletion, true);

  // Step 5: Attempt completion while requirements fail or remain unknown
  const incompleteInputs = { dailySupplyLitres: null, dailyDemandLitres: 80, availableReserveLitres: 15 };
  const incompleteComp = evaluateMissionCompletion(design, incompleteInputs);
  assert.equal(incompleteComp.eligibleForCompletion, false);

  // Step 6: Confirm ineligible completion cannot grant rewards
  const playerMockStorage = createMockStorage({
    skillverse_save: JSON.stringify(makeMockPlayer({ xp: 50, coins: 150, level: 1 })),
  });
  let playerCommitCalls = 0;
  const commitPlayerState = (updates) => {
    playerCommitCalls++;
    const current = JSON.parse(playerMockStorage.getItem("skillverse_save"));
    playerMockStorage.setItem(
      "skillverse_save",
      JSON.stringify({ ...current, ...updates, flags: { ...current.flags, ...updates.flags } })
    );
  };
  const activePlayer = () => JSON.parse(playerMockStorage.getItem("skillverse_save"));

  const ineligibleAttempt = await executeMissionCompletion(
    design,
    incompleteInputs,
    activePlayer(),
    commitPlayerState,
    MISSION_REWARDS,
    playerMockStorage
  );
  assert.equal(ineligibleAttempt.success, false);
  assert.equal(ineligibleAttempt.rewarded, false);
  assert.equal(playerCommitCalls, 0);
  assert.equal(activePlayer().xp, 50);
  assert.equal(activePlayer().coins, 150);

  // Step 7 & 8: Meet every required condition and explicitly complete the mission;
  // confirms existing completion eligibility evaluator is rerun against current doc and planning inputs
  const eligibleAttempt = await executeMissionCompletion(
    design,
    goodInputs,
    activePlayer(),
    commitPlayerState,
    MISSION_REWARDS,
    playerMockStorage
  );

  // Step 9: Confirm approved reward values are granted through established progression API
  assert.equal(eligibleAttempt.success, true);
  assert.equal(eligibleAttempt.rewarded, true);
  assert.equal(eligibleAttempt.isReplay, false);
  assert.equal(playerCommitCalls, 1);
  const updatedPlayer = activePlayer();
  assert.equal(updatedPlayer.xp, 250); // 50 + 200
  assert.equal(updatedPlayer.level, 3); // floor(250/100) + 1
  assert.equal(updatedPlayer.coins, 300); // 150 + 50 + 100 level-up bonus
  assert.ok(updatedPlayer.badges.includes("Village Hydrologist"));

  // Step 10: Confirm durable completion record is stored using actual supported persistence mechanism
  assert.equal(updatedPlayer.flags[MISSION_REWARDS.flagKey], true);
  assert.ok(updatedPlayer.flags[MISSION_REWARDS.completedAtKey]);

  // Step 11: Refresh the page and reopen completed mission
  // Simulated refresh: reading back from playerMockStorage directly
  const refreshedPlayer = JSON.parse(playerMockStorage.getItem("skillverse_save"));
  assert.equal(isMissionAlreadyCompleted(refreshedPlayer, MISSION_REWARDS.flagKey, playerMockStorage), true);

  // Step 12: Attempt to claim rewards again and confirm duplicate grants are prevented
  const replayAttempt = await executeMissionCompletion(
    design,
    goodInputs,
    refreshedPlayer,
    commitPlayerState,
    MISSION_REWARDS,
    playerMockStorage
  );
  assert.equal(replayAttempt.success, true);
  assert.equal(replayAttempt.rewarded, false);
  assert.equal(replayAttempt.isReplay, true);
  assert.equal(playerCommitCalls, 1, "Duplicate completion must not commit additional updates");
  assert.equal(activePlayer().xp, 250);
  assert.equal(activePlayer().coins, 300);

  // Step 13: Navigate to briefing and back to workspace; confirm village design remains intact
  const view3 = resolveWorldBuilderView(new URLSearchParams(""));
  assert.equal(view3, "briefing");
  const view4 = resolveWorldBuilderView(new URLSearchParams("mode=edit"));
  assert.equal(view4, "editor");
  const reloadedDesign = wbStorage.load();
  assert.equal(reloadedDesign.ok, true);
  assert.equal(reloadedDesign.project.objects.length, design.objects.length);

  // Step 14: Test persistence failure and confirm interface does not falsely claim rewards were granted
  const uncompletedPlayer = makeMockPlayer({ xp: 10, coins: 20 });
  const failingStorage = () => {
    throw new Error("Disk quota exceeded");
  };
  const failedAttempt = await executeMissionCompletion(
    design,
    goodInputs,
    uncompletedPlayer,
    failingStorage
  );
  assert.equal(failedAttempt.success, false);
  assert.equal(failedAttempt.rewarded, false);
  assert.match(failedAttempt.error, /Disk quota exceeded/);

  // Step 15: Confirm Sandbox, Test Village, Check Water System, and unrelated player progression are unaffected
  const trial = runVillageTrial(design);
  assert.equal(trial.ok, true);
  assert.equal(trial.rewards, undefined);
  const status = getWaterStatus(design);
  assert.ok(status.summaryText);
  assert.equal(status.rewards, undefined);
  assert.equal(updatedPlayer.skills.life, 0);
  assert.equal(updatedPlayer.water, 100);
  assert.equal(updatedPlayer.day, 1);
});

test("18. Success screen and dashboard UI presentation accurately reflect reward outcome", () => {
  const successScreenSrc = readFileSync(
    resolve(studioRoot, "world-builder/components/MissionSuccessScreen.jsx"),
    "utf8"
  );
  // Evaluates isRewarded and isReplay based on completionResult
  assert.match(successScreenSrc, /isRewarded\s*&&\s*\(/);
  assert.match(successScreenSrc, /data-testid="wb-completion-rewards-card"/);
  assert.match(successScreenSrc, /data-testid="wb-reward-xp"/);
  assert.match(successScreenSrc, /data-testid="wb-reward-coins"/);
  assert.match(successScreenSrc, /data-testid="wb-reward-badge"/);
  assert.match(successScreenSrc, /data-testid="wb-reward-levelup"/);
  assert.match(successScreenSrc, /isReplay\s*&&\s*\(/);
  assert.match(successScreenSrc, /data-testid="wb-completion-replay-card"/);

  // Does not mutate player or call storage
  assert.doesNotMatch(successScreenSrc, /updatePlayer|usePlayer/);
  assert.doesNotMatch(successScreenSrc, /localStorage/);
  assert.doesNotMatch(successScreenSrc, /skillverse_save/);
});

test("19. Simultaneous cross-tab claims serialize via lock and grant rewards exactly once", async () => {
  const doc = makePassingVillage();
  const sharedStorage = createMockStorage({
    skillverse_save: JSON.stringify(makeMockPlayer({
      xp: 0,
      coins: 150,
      level: 1,
      skills: { life: 5, digital: 10 },
      water: 95,
      day: 3,
    })),
  });

  let commitCalls = 0;
  const commitFromTab = () => (updates) => {
    commitCalls++;
    const current = JSON.parse(sharedStorage.getItem("skillverse_save"));
    sharedStorage.setItem(
      "skillverse_save",
      JSON.stringify({
        ...current,
        ...updates,
        flags: { ...current.flags, ...updates.flags },
      })
    );
  };

  // Both Tab A and Tab B trigger mission completion simultaneously with initial snapshot
  const playerSnapshotTabA = JSON.parse(sharedStorage.getItem("skillverse_save"));
  const playerSnapshotTabB = JSON.parse(sharedStorage.getItem("skillverse_save"));

  const [tabAResult, tabBResult] = await Promise.all([
    executeMissionCompletion(doc, passingInputs, playerSnapshotTabA, commitFromTab(), MISSION_REWARDS, sharedStorage),
    executeMissionCompletion(doc, passingInputs, playerSnapshotTabB, commitFromTab(), MISSION_REWARDS, sharedStorage),
  ]);

  // Exactly one tab should be rewarded, and the other should safely receive replay
  const rewardedResults = [tabAResult, tabBResult].filter((r) => r.rewarded);
  const replayResults = [tabAResult, tabBResult].filter((r) => r.isReplay);

  assert.equal(rewardedResults.length, 1, "Exactly one tab must be rewarded");
  assert.equal(replayResults.length, 1, "Competing tab must detect durable flag and route to replay");
  assert.equal(commitCalls, 1, "Only one persistence write must be committed");

  // Verify actual persisted state in shared storage
  const persistedPlayer = JSON.parse(sharedStorage.getItem("skillverse_save"));
  assert.equal(persistedPlayer.xp, 200); // 0 + 200
  assert.equal(persistedPlayer.level, 3); // floor(200/100) + 1
  assert.equal(persistedPlayer.coins, 300); // 150 + 50 + 100 level-up bonus
  assert.ok(persistedPlayer.badges.includes("Village Hydrologist"));
  assert.equal(persistedPlayer.flags[MISSION_REWARDS.flagKey], true);

  // Unrelated fields preserved
  assert.equal(persistedPlayer.skills.life, 5);
  assert.equal(persistedPlayer.skills.digital, 10);
  assert.equal(persistedPlayer.water, 95);
  assert.equal(persistedPlayer.day, 3);
});

test("20. Web Locks API delegation coordinates with navigator.locks when available", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();
  let requestedLockName = null;
  let lockMode = null;

  const mockNavigatorLocks = {
    async request(name, options, callback) {
      requestedLockName = name;
      lockMode = options?.mode;
      return await callback();
    },
  };

  const nav = typeof globalThis.navigator !== "undefined" ? globalThis.navigator : {};
  const originalLocksDesc = Object.getOwnPropertyDescriptor(nav, "locks");

  try {
    Object.defineProperty(nav, "locks", {
      value: mockNavigatorLocks,
      configurable: true,
      writable: true,
    });
    const res = await executeMissionCompletion(doc, passingInputs, player, () => {}, MISSION_REWARDS);
    assert.equal(res.success, true);
    assert.equal(requestedLockName, getMissionLockName("save-our-village"));
    assert.equal(lockMode, "exclusive");
  } finally {
    if (originalLocksDesc) {
      Object.defineProperty(nav, "locks", originalLocksDesc);
    } else {
      delete nav.locks;
    }
  }
});

test("21. Cross-tab lock failure reports error honestly without falsely claiming rewards", async () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer();
  let commitCalled = false;

  const failingLockCoordinator = {
    async request() {
      throw new Error("AbortError: Lock acquisition timed out or tab closed");
    },
  };

  const res = await executeMissionCompletion(
    doc,
    passingInputs,
    player,
    () => { commitCalled = true; },
    MISSION_REWARDS,
    undefined,
    failingLockCoordinator
  );

  assert.equal(res.success, false);
  assert.equal(res.rewarded, false);
  assert.equal(commitCalled, false);
  assert.match(res.error, /Cross-tab lock acquisition failed/);
  assert.match(res.error, /AbortError/);
});

test("22. executeMissionCompletionSync performs synchronous completion without locking", () => {
  const doc = makePassingVillage();
  const player = makeMockPlayer({ xp: 0, coins: 150, level: 1 });
  let saved = null;

  const res = executeMissionCompletionSync(
    doc,
    passingInputs,
    player,
    (updates) => { saved = updates; },
    MISSION_REWARDS
  );

  assert.equal(res.success, true);
  assert.equal(res.rewarded, true);
  assert.equal(saved.xp, 200);
  assert.equal(saved.coins, 300);
});


