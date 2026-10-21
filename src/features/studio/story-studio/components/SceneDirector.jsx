import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  Flag,
  GitFork,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  CHARACTER_EXPRESSIONS,
  CHARACTER_EXPRESSION_META,
  CHARACTER_FACING,
  CHARACTER_SLOTS,
  DIALOGUE_TYPES,
  STORY_BACKGROUNDS,
  STORY_BACKGROUND_IDS,
  STORY_CHARACTERS,
  STORY_CHARACTER_IDS,
  STORY_LIMITS,
  STORY_PROPS,
  STORY_PROP_IDS,
} from "../engine/storySchema.js";
import {
  createStoryVoicePlayer,
  resolveCharacterVoice,
  useSystemVoices,
} from "../engine/storyVoiceEngine.js";
import { StoryCharacter } from "../art/StoryArtComponents.jsx";

/**
 * Scene Director Inspector for Story Studio (S1.4 & S1.12).
 *
 * Controls:
 * 1. Background Setting Selector (6 Presets)
 * 2. Character Staging in Left, Center, and Right slots (Maya, Tariq, Elder Samira, Dr. Leo, Pip)
 * 3. Character Expression, Facing, and System Voice Selection with Auditory Preview
 * 4. Scene Narration Editor (up to 400 chars) with Narrator Voice Preview
 * 5. Dialogue Line Editor with speaker association, bubble types, and line speech triggers
 * 6. Props Preset Selector (up to 6 props)
 */
export default function SceneDirector({
  scene,
  onSetBackground,
  onSetNarration,
  onAddCharacter,
  onUpdateCharacter,
  onRemoveCharacter,
  onAddDialogueLine,
  onUpdateDialogueLine,
  onRemoveDialogueLine,
  onMoveDialogueLine,
  onToggleProp,
  allScenes = [],
  onAddChoice,
  onUpdateChoice,
  onRemoveChoice,
  onMoveChoice,
  onSetSceneIsEnding,
  characterVoices = {},
  onSetCharacterVoice,
}) {
  const { voices, isSupported: isVoiceSupported } = useSystemVoices();
  const [speakingLineId, setSpeakingLineId] = useState(null);

  const voicePlayerRef = useRef(null);
  if (!voicePlayerRef.current) {
    voicePlayerRef.current = createStoryVoicePlayer({
      onStateChange: ({ isSpeaking, currentSpeakingInfo }) => {
        setSpeakingLineId(isSpeaking ? currentSpeakingInfo?.lineId : null);
      },
    });
  }

  useEffect(() => {
    return () => {
      voicePlayerRef.current?.cleanup();
    };
  }, []);

  useEffect(() => {
    voicePlayerRef.current?.stop();
    setSpeakingLineId(null);
  }, [scene?.id]);

  const handleToggleSpeakLine = useCallback(
    (line) => {
      if (!line) return;
      const player = voicePlayerRef.current;
      if (speakingLineId === line.id) {
        player?.stop();
        setSpeakingLineId(null);
        return;
      }
      setSpeakingLineId(line.id);
      player?.speak({
        line,
        speakerId: line.speakerId,
        characterVoices,
        onEnd: () => setSpeakingLineId((curr) => (curr === line.id ? null : curr)),
        onError: () => setSpeakingLineId((curr) => (curr === line.id ? null : curr)),
      });
    },
    [speakingLineId, characterVoices]
  );

  const handlePreviewCharacterVoice = useCallback(
    (charId) => {
      const player = voicePlayerRef.current;
      player?.preview({
        characterId: charId,
        characterVoices,
      });
    },
    [characterVoices]
  );

  const handlePreviewNarratorVoice = useCallback(() => {
    const player = voicePlayerRef.current;
    player?.preview({
      characterId: "narrator",
      characterVoices,
    });
  }, [characterVoices]);

  const narratorVoice = resolveCharacterVoice({
    characterId: "narrator",
    characterVoices,
    availableVoices: voices,
  });

  const [addingSlot, setAddingSlot] = useState(null);
  const [narrationInput, setNarrationInput] = useState(() => scene?.narration || "");
  const [collapsedSections, setCollapsedSections] = useState({
    backgrounds: false,
    characters: false,
    narration: false,
    dialogue: false,
    props: false,
    choices: false,
  });

  const toggleSection = (key) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const allCollapsed = Object.values(collapsedSections).every(Boolean);
  const toggleAllSections = () => {
    const nextVal = !allCollapsed;
    setCollapsedSections({
      backgrounds: nextVal,
      characters: nextVal,
      narration: nextVal,
      dialogue: nextVal,
      props: nextVal,
      choices: nextVal,
    });
  };

  // Sync narration input cleanly when scene or narration changes
  useEffect(() => {
    setNarrationInput(scene?.narration || "");
  }, [scene?.id, scene?.narration]);

  const characters = scene?.characters || [];
  const dialogue = scene?.dialogue || [];
  const props = scene?.props || [];
  const choices = scene?.choices || [];
  const otherScenes = allScenes.filter((s) => s && s.id !== scene?.id);
  const isEnding = Boolean(scene?.isEnding);

  // Slot map
  const slotMap = { left: null, center: null, right: null };
  characters.forEach((c) => {
    if (c.slot && slotMap[c.slot] !== undefined) {
      slotMap[c.slot] = c;
    }
  });

  const handleNarrationBlur = () => {
    const trimmed = narrationInput.trim();
    if (onSetNarration && trimmed !== scene?.narration) {
      onSetNarration(trimmed.slice(0, STORY_LIMITS.MAX_NARRATION_LENGTH));
    }
  };

  const handleAddCharacterToSlot = (slot, characterId) => {
    if (!onAddCharacter) return;
    onAddCharacter({
      characterId,
      slot,
      expression: "happy",
      facing: STORY_CHARACTERS[characterId]?.defaultFacing || "right",
    });
    setAddingSlot(null);
  };

  return (
    <aside
      className="story-director-aside"
      aria-label="Scene Director"
      data-testid="story-director"
    >
      <header className="story-director-header">
        <div className="story-director-header-row">
          <div>
            <h2 className="story-director-title">Scene Director</h2>
            <span className="story-director-subtitle">Properties & Staging</span>
          </div>
          <button
            type="button"
            className="story-btn story-btn--ghost story-btn--xs story-dir-toggle-all-btn"
            onClick={toggleAllSections}
            aria-label={allCollapsed ? "Expand all sections" : "Collapse all sections"}
            data-testid="story-dir-toggle-all-btn"
          >
            {allCollapsed ? "Expand All" : "Collapse All"}
          </button>
        </div>
      </header>

      <div className="story-director-body">
        {/* ===================================================================
            1. BACKGROUND PRESET PICKER
            =================================================================== */}
        <section className="story-dir-section" data-testid="story-dir-backgrounds">
          <div
            className="story-dir-section-header story-dir-section-header--clickable"
            onClick={() => toggleSection("backgrounds")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSection("backgrounds");
              }
            }}
            aria-expanded={!collapsedSections.backgrounds}
            aria-controls="story-dir-backgrounds-body"
            data-testid="story-dir-header-backgrounds"
          >
            <div className="story-dir-sec-title-group">
              <Compass size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 className="story-dir-sec-title">Setting Background</h3>
            </div>
            <span className="story-dir-sec-chevron" aria-hidden="true">
              {collapsedSections.backgrounds ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </div>

          <div
            id="story-dir-backgrounds-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.backgrounds}
          >
            <div className="story-bg-grid" role="radiogroup" aria-label="Scene Background">
              {STORY_BACKGROUND_IDS.map((bgId) => {
                const bg = STORY_BACKGROUNDS[bgId];
                const isSelected = scene?.background === bgId;

                return (
                  <button
                    key={bgId}
                    type="button"
                    className={`story-bg-btn ${isSelected ? "story-bg-btn--active" : ""}`}
                    onClick={() => onSetBackground && onSetBackground(bgId)}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${bg.label} setting: ${bg.description}`}
                    title={bg.description}
                    data-testid={`story-bg-option-${bgId}`}
                  >
                    <span className="story-bg-btn-tag" data-theme={bg.theme}>
                      {bg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            2. CHARACTER STAGING (LEFT, CENTER, RIGHT SLOTS)
            =================================================================== */}
        <section className="story-dir-section" data-testid="story-dir-characters">
          <div
            className="story-dir-section-header story-dir-section-header--clickable"
            onClick={() => toggleSection("characters")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSection("characters");
              }
            }}
            aria-expanded={!collapsedSections.characters}
            aria-controls="story-dir-characters-body"
            data-testid="story-dir-header-characters"
          >
            <div className="story-dir-sec-title-group">
              <Users size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 className="story-dir-sec-title">
                Characters ({characters.length} / {STORY_LIMITS.MAX_CHARACTERS_PER_SCENE})
              </h3>
            </div>
            <span className="story-dir-sec-chevron" aria-hidden="true">
              {collapsedSections.characters ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </div>

          <div
            id="story-dir-characters-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.characters}
          >
            <div className="story-slots-list">
              {CHARACTER_SLOTS.map((slot) => {
                const placed = slotMap[slot];
                const isPicking = addingSlot === slot;
                const charMeta = placed
                  ? STORY_CHARACTERS[placed.characterId] || { name: placed.characterId, role: "" }
                  : null;
                const charVoice = placed
                  ? resolveCharacterVoice({
                      characterId: placed.characterId,
                      characterVoices,
                      availableVoices: voices,
                    })
                  : null;

                return (
                  <div
                    key={slot}
                    className={`story-slot-editor ${
                      placed ? "story-slot-editor--occupied" : "story-slot-editor--empty"
                    }`}
                    data-testid={`story-slot-editor-${slot}`}
                  >
                    <div className="story-slot-editor-header">
                      <span className="story-slot-name-badge">{slot} slot</span>
                      {placed && (
                        <button
                          type="button"
                          className="story-icon-btn story-icon-btn--cancel"
                          onClick={() => onRemoveCharacter && onRemoveCharacter(placed.id)}
                          aria-label={`Remove ${charMeta?.name} from ${slot} slot`}
                          title="Remove character"
                          data-testid={`story-remove-char-${placed.id}`}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {placed ? (
                      <div className="story-slot-placed-controls">
                        <div className="story-slot-char-row">
                          <span className="story-slot-avatar" aria-hidden="true">
                            <StoryCharacter
                              characterId={placed.characterId}
                              expression={placed.expression}
                              facing="right"
                            />
                          </span>
                          <span className="story-slot-char-text">
                            <strong className="story-slot-char-name">
                              {charMeta?.name}
                            </strong>
                            <span className="story-slot-char-role">
                              {charMeta?.role}
                            </span>
                          </span>
                        </div>

                        {/* Mood picker */}
                        <div className="story-slot-field-row">
                          <span className="story-slot-field-label" id={`exp-label-${placed.id}`}>
                            Mood
                          </span>
                          <div
                            className="story-mood-grid"
                            role="radiogroup"
                            aria-labelledby={`exp-label-${placed.id}`}
                            data-testid={`story-char-exp-${placed.id}`}
                          >
                            {CHARACTER_EXPRESSIONS.map((exp) => {
                              const meta = CHARACTER_EXPRESSION_META[exp] || { label: exp, emoji: "🙂" };
                              const isOn = placed.expression === exp;
                              return (
                                <button
                                  key={exp}
                                  type="button"
                                  role="radio"
                                  aria-checked={isOn}
                                  className={`story-mood-btn ${isOn ? "story-mood-btn--active" : ""}`}
                                  onClick={() =>
                                    onUpdateCharacter && onUpdateCharacter(placed.id, { expression: exp })
                                  }
                                  data-testid={`story-char-exp-${placed.id}-${exp}`}
                                >
                                  <span className="story-mood-emoji" aria-hidden="true">{meta.emoji}</span>
                                  <span className="story-mood-label">{meta.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Facing Direction Toggle */}
                        <div className="story-slot-field-row">
                          <span className="story-slot-field-label">Facing:</span>
                          <div className="story-facing-toggle">
                            <button
                              type="button"
                              className={`story-facing-btn ${
                                placed.facing === "left" ? "story-facing-btn--active" : ""
                              }`}
                              onClick={() =>
                                onUpdateCharacter &&
                                onUpdateCharacter(placed.id, { facing: "left" })
                              }
                              aria-label={`Face left`}
                              aria-pressed={placed.facing === "left"}
                              data-testid={`story-char-facing-left-${placed.id}`}
                            >
                              ◀ Left
                            </button>
                            <button
                              type="button"
                              className={`story-facing-btn ${
                                placed.facing === "right" ? "story-facing-btn--active" : ""
                              }`}
                              onClick={() =>
                                onUpdateCharacter &&
                                onUpdateCharacter(placed.id, { facing: "right" })
                              }
                              aria-label={`Face right`}
                              aria-pressed={placed.facing === "right"}
                              data-testid={`story-char-facing-right-${placed.id}`}
                            >
                              Right ▶
                            </button>
                          </div>
                        </div>

                        {/* Voice Selector & Auditory Preview */}
                        <div className="story-slot-field-row">
                          <label
                            htmlFor={`voice-${placed.id}`}
                            className="story-slot-field-label"
                          >
                            Voice:
                          </label>
                          <div className="story-voice-picker-inline">
                            <select
                              id={`voice-${placed.id}`}
                              className="story-slot-select story-voice-select"
                              value={characterVoices[placed.characterId]?.voiceURI || ""}
                              onChange={(e) => {
                                const uri = e.target.value;
                                const chosen = voices.find((v) => v.voiceURI === uri);
                                onSetCharacterVoice &&
                                  onSetCharacterVoice(placed.characterId, {
                                    voiceURI: uri,
                                    voiceName: chosen?.name || "",
                                  });
                              }}
                              aria-label={`Voice for ${charMeta?.name}`}
                              title={`Voice: ${charVoice?.voiceName || "Default"}`}
                              data-testid={`story-char-voice-${placed.id}`}
                            >
                              <option value="">Default ({charVoice?.voiceName || `${charMeta?.name} Voice`})</option>
                              {voices.map((v) => (
                                <option key={v.voiceURI} value={v.voiceURI}>
                                  {v.name} {v.lang ? `(${v.lang})` : ""}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="story-voice-preview-btn"
                              onClick={() => handlePreviewCharacterVoice(placed.characterId)}
                              aria-label={`Preview voice for ${charMeta?.name} (${charVoice?.voiceName || "Default"})`}
                              title={`Preview voice for ${charMeta?.name} (${charVoice?.voiceName || "Default"})`}
                              data-testid={`story-voice-preview-${placed.id}`}
                            >
                              <Volume2 size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : isPicking ? (
                      <div className="story-slot-picker-group">
                        <p className="story-slot-picker-title">Choose character:</p>
                        <div className="story-slot-picker-btns">
                          {STORY_CHARACTER_IDS.map((charId) => {
                            const candidateMeta = STORY_CHARACTERS[charId];
                            return (
                              <button
                                key={charId}
                                type="button"
                                className="story-slot-pick-char-btn"
                                onClick={() => handleAddCharacterToSlot(slot, charId)}
                                data-testid={`story-pick-${slot}-${charId}`}
                              >
                                <span className="story-pick-avatar" aria-hidden="true">
                                  <StoryCharacter
                                    characterId={charId}
                                    expression="happy"
                                    facing="right"
                                  />
                                </span>
                                <span className="story-pick-name">{candidateMeta?.name || charId}</span>
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          className="story-btn story-btn--ghost story-btn--xs"
                          onClick={() => setAddingSlot(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="story-slot-add-btn"
                        onClick={() => setAddingSlot(slot)}
                        disabled={characters.length >= STORY_LIMITS.MAX_CHARACTERS_PER_SCENE}
                        data-testid={`story-add-to-slot-${slot}`}
                      >
                        <Plus size={14} aria-hidden="true" />
                        <span>Place in {slot} slot</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            3. SCENE NARRATION
            =================================================================== */}
        <section className="story-dir-section" data-testid="story-dir-narration">
          <div
            className="story-dir-section-header story-dir-section-header--clickable"
            onClick={() => toggleSection("narration")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSection("narration");
              }
            }}
            aria-expanded={!collapsedSections.narration}
            aria-controls="story-dir-narration-body"
            data-testid="story-dir-header-narration"
          >
            <div className="story-dir-sec-title-group">
              <BookOpen size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 className="story-dir-sec-title">Scene Narration</h3>
            </div>
            <div className="story-dir-sec-header-right">
              <button
                type="button"
                className="story-voice-preview-btn story-narrator-preview-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewNarratorVoice();
                }}
                aria-label={`Preview Narrator Voice (${narratorVoice.voiceName})`}
                title={`Preview Narrator Voice (${narratorVoice.voiceName})`}
                data-testid="story-narrator-voice-preview"
              >
                <Volume2 size={13} aria-hidden="true" />
              </button>
              <span className="story-char-counter">
                {narrationInput.length} / {STORY_LIMITS.MAX_NARRATION_LENGTH}
              </span>
              <span className="story-dir-sec-chevron" aria-hidden="true">
                {collapsedSections.narration ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>
          </div>

          <div
            id="story-dir-narration-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.narration}
          >
            <textarea
              id="story-narration-input"
              className="story-narration-textarea"
              rows={3}
              value={narrationInput}
              onChange={(e) => setNarrationInput(e.target.value)}
              onBlur={handleNarrationBlur}
              maxLength={STORY_LIMITS.MAX_NARRATION_LENGTH}
              placeholder="Set the scene: what is happening, where are the characters, what is the mood?"
              aria-label="Scene Narration"
              data-testid="story-narration-input"
            />
          </div>
        </section>

        {/* ===================================================================
            4. DIALOGUE LINES EDITOR
            =================================================================== */}
        <section className="story-dir-section" data-testid="story-dir-dialogue">
          <div className="story-dir-section-header">
            <div
              className="story-dir-sec-title-group story-dir-sec-title-group--clickable"
              onClick={() => toggleSection("dialogue")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSection("dialogue");
                }
              }}
              aria-expanded={!collapsedSections.dialogue}
              aria-controls="story-dir-dialogue-body"
              data-testid="story-dir-header-dialogue"
            >
              <MessageSquare size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 className="story-dir-sec-title">
                Dialogue Lines ({dialogue.length} / {STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE})
              </h3>
              <span className="story-dir-sec-chevron" aria-hidden="true">
                {collapsedSections.dialogue ? (
                  <ChevronRight size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>
            <button
              type="button"
              className="story-btn story-btn--primary story-btn--xs"
              onClick={(e) => {
                e.stopPropagation();
                if (collapsedSections.dialogue) {
                  setCollapsedSections((prev) => ({ ...prev, dialogue: false }));
                }
                onAddDialogueLine && onAddDialogueLine();
              }}
              disabled={dialogue.length >= STORY_LIMITS.MAX_DIALOGUE_LINES_PER_SCENE}
              aria-label="Add dialogue line"
              data-testid="story-add-dialogue-btn"
            >
              <Plus size={13} aria-hidden="true" />
              <span>Add Line</span>
            </button>
          </div>

          <div
            id="story-dir-dialogue-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.dialogue}
          >
            <div className="story-dialogue-editor-list">
              {dialogue.map((line, index) => {
                // Valid speaker options: narrator + placed characters
                const speakerOptions = [
                  { id: "narrator", label: "Narrator" },
                  ...characters.map((c) => ({
                    id: c.characterId,
                    label: STORY_CHARACTERS[c.characterId]?.name || c.characterId,
                  })),
                ];

                return (
                  <div
                    key={line.id}
                    className="story-dialogue-editor-item"
                    data-testid={`story-dialogue-editor-item-${line.id}`}
                  >
                    <div className="story-dialogue-item-top">
                      {/* Speaker Select */}
                      <select
                        className="story-dialogue-select story-dialogue-speaker-select"
                        value={line.speakerId}
                        onChange={(e) =>
                          onUpdateDialogueLine &&
                          onUpdateDialogueLine(line.id, { speakerId: e.target.value })
                        }
                        aria-label="Speaker"
                        data-testid={`story-dialogue-speaker-${line.id}`}
                      >
                        {speakerOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Bubble Type Select */}
                      <select
                        className="story-dialogue-select story-dialogue-type-select"
                        value={line.type}
                        onChange={(e) =>
                          onUpdateDialogueLine &&
                          onUpdateDialogueLine(line.id, { type: e.target.value })
                        }
                        aria-label="Bubble type"
                        data-testid={`story-dialogue-type-${line.id}`}
                      >
                        <option value="speech">💬 Speech</option>
                        <option value="thought">💭 Thought</option>
                        <option value="shout">💥 Shout</option>
                      </select>

                      {/* Actions: Speak, Reorder & Delete */}
                      <div className="story-dialogue-item-actions">
                        <button
                          type="button"
                          className={`story-icon-btn story-icon-btn--voice ${
                            speakingLineId === line.id ? "story-icon-btn--active" : ""
                          }`}
                          onClick={() => handleToggleSpeakLine(line)}
                          aria-label={
                            speakingLineId === line.id
                              ? `Stop speaking line: ${line.text}`
                              : `Read line aloud: ${line.text}`
                          }
                          title={speakingLineId === line.id ? "Stop voice" : "Read aloud"}
                          data-testid={`story-dialogue-voice-${line.id}`}
                        >
                          {speakingLineId === line.id ? (
                            <VolumeX size={12} aria-hidden="true" />
                          ) : (
                            <Volume2 size={12} aria-hidden="true" />
                          )}
                        </button>
                        <button
                          type="button"
                          className="story-icon-btn"
                          onClick={() =>
                            onMoveDialogueLine && onMoveDialogueLine(line.id, "up")
                          }
                          disabled={index === 0}
                          aria-label="Move line up"
                          title="Move Up"
                          data-testid={`story-dialogue-up-${line.id}`}
                        >
                          <ArrowUp size={12} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="story-icon-btn"
                          onClick={() =>
                            onMoveDialogueLine && onMoveDialogueLine(line.id, "down")
                          }
                          disabled={index === dialogue.length - 1}
                          aria-label="Move line down"
                          title="Move Down"
                          data-testid={`story-dialogue-down-${line.id}`}
                        >
                          <ArrowDown size={12} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="story-icon-btn story-icon-btn--cancel"
                          onClick={() =>
                            onRemoveDialogueLine && onRemoveDialogueLine(line.id)
                          }
                          aria-label="Delete line"
                          title="Delete Line"
                          data-testid={`story-dialogue-delete-${line.id}`}
                        >
                          <Trash2 size={12} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Text Input */}
                    <textarea
                      id={`dialogue-text-${line.id}`}
                      className="story-dialogue-input"
                      rows={2}
                      value={line.text}
                      onChange={(e) =>
                        onUpdateDialogueLine &&
                        onUpdateDialogueLine(line.id, { text: e.target.value })
                      }
                      maxLength={STORY_LIMITS.MAX_DIALOGUE_TEXT_LENGTH}
                      placeholder="Enter what they say..."
                      aria-label="Dialogue text"
                      data-testid={`story-dialogue-text-${line.id}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================
            5. PROPS PRESET SELECTOR
            =================================================================== */}
        <section className="story-dir-section" data-testid="story-dir-props">
          <div
            className="story-dir-section-header story-dir-section-header--clickable"
            onClick={() => toggleSection("props")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSection("props");
              }
            }}
            aria-expanded={!collapsedSections.props}
            aria-controls="story-dir-props-body"
            data-testid="story-dir-header-props"
          >
            <div className="story-dir-sec-title-group">
              <Sparkles size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 className="story-dir-sec-title">
                Scene Props ({props.length} / {STORY_LIMITS.MAX_PROPS_PER_SCENE})
              </h3>
            </div>
            <span className="story-dir-sec-chevron" aria-hidden="true">
              {collapsedSections.props ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </div>

          <div
            id="story-dir-props-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.props}
          >
            <div className="story-props-grid">
              {STORY_PROP_IDS.map((propId) => {
                const propMeta = STORY_PROPS[propId];
                const isPlaced = props.includes(propId);

                return (
                  <button
                    key={propId}
                    type="button"
                    className={`story-prop-chip ${
                      isPlaced ? "story-prop-chip--active" : ""
                    }`}
                    onClick={() => onToggleProp && onToggleProp(propId)}
                    disabled={!isPlaced && props.length >= STORY_LIMITS.MAX_PROPS_PER_SCENE}
                    aria-pressed={isPlaced}
                    aria-label={`${isPlaced ? "Remove" : "Add"} ${propMeta.label} prop`}
                    data-testid={`story-prop-toggle-${propId}`}
                  >
                    <span>{isPlaced ? "✓ " : "+ "}</span>
                    <span>{propMeta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 7: Branching Choices & Ending (S1.9) */}
        <section
          className="story-dir-sec story-dir-sec--choices"
          aria-labelledby="story-dir-choices-title"
          data-testid="story-director-choices-section"
        >
          <div
            className="story-dir-sec-header"
            onClick={() => toggleSection("choices")}
            role="button"
            tabIndex={0}
            aria-expanded={!collapsedSections.choices}
            aria-controls="story-dir-choices-body"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleSection("choices");
              }
            }}
          >
            <div className="story-dir-sec-title-group">
              <GitFork size={16} aria-hidden="true" className="story-dir-sec-icon" />
              <h3 id="story-dir-choices-title" className="story-dir-sec-title">
                Branching Choices & Ending
              </h3>
            </div>
            <span
              className="story-dir-sec-badge"
              data-testid="story-choices-count-badge"
            >
              {isEnding ? "Ending" : `${choices.length} / ${STORY_LIMITS.MAX_CHOICES_PER_SCENE}`}
            </span>
            <span className="story-dir-sec-chevron" aria-hidden="true">
              {collapsedSections.choices ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </div>

          <div
            id="story-dir-choices-body"
            className="story-dir-sec-body"
            hidden={collapsedSections.choices}
          >
            {/* Ending Scene Toggle */}
            <div className="story-ending-toggle-group">
              <label className="story-checkbox-label">
                <input
                  type="checkbox"
                  checked={isEnding}
                  onChange={(e) => onSetSceneIsEnding && onSetSceneIsEnding(e.target.checked)}
                  data-testid="story-is-ending-toggle"
                />
                <span className="story-checkbox-custom">
                  <Flag size={13} aria-hidden="true" />
                </span>
                <span className="story-checkbox-text">
                  Mark as Ending Scene (Concludes story without choices)
                </span>
              </label>
            </div>

            {isEnding ? (
              <div className="story-ending-notice" data-testid="story-ending-notice">
                <Flag size={18} aria-hidden="true" />
                <p>
                  This scene is an ending. When readers reach this scene and finish its narration and dialogue, they will see <strong>"The End"</strong> and can choose to restart or return.
                </p>
              </div>
            ) : (
              <div className="story-choices-manager">
                {choices.length === 0 ? (
                  <div className="story-choices-empty" data-testid="story-choices-empty">
                    <p className="story-choices-empty-text">
                      No choices yet. Readers will step sequentially to the next scene. Add up to {STORY_LIMITS.MAX_CHOICES_PER_SCENE} choices to give readers a decision!
                    </p>
                  </div>
                ) : (
                  <div className="story-choices-list">
                    {choices.map((choice, cIdx) => (
                      <div
                        key={choice.id}
                        className="story-choice-edit-card"
                        data-testid={`story-choice-card-${choice.id}`}
                      >
                        <div className="story-choice-card-header">
                          <span className="story-choice-num">Path {cIdx + 1}</span>
                          <div className="story-choice-header-actions">
                            <button
                              type="button"
                              className="story-icon-btn story-icon-btn--xs"
                              onClick={() => onMoveChoice && onMoveChoice(choice.id, "up")}
                              disabled={cIdx === 0}
                              title="Move choice up"
                              aria-label="Move choice up"
                              data-testid={`story-choice-move-up-${choice.id}`}
                            >
                              <ArrowUp size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="story-icon-btn story-icon-btn--xs"
                              onClick={() => onMoveChoice && onMoveChoice(choice.id, "down")}
                              disabled={cIdx === choices.length - 1}
                              title="Move choice down"
                              aria-label="Move choice down"
                              data-testid={`story-choice-move-down-${choice.id}`}
                            >
                              <ArrowDown size={12} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="story-icon-btn story-icon-btn--danger story-icon-btn--xs"
                              onClick={() => onRemoveChoice && onRemoveChoice(choice.id)}
                              title="Delete choice"
                              aria-label="Delete choice"
                              data-testid={`story-choice-delete-${choice.id}`}
                            >
                              <Trash2 size={12} aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {/* Choice Text Input */}
                        <div className="story-choice-field">
                          <label className="story-choice-label">Button Label:</label>
                          <input
                            type="text"
                            className="story-input story-input--sm"
                            value={choice.text}
                            onChange={(e) =>
                              onUpdateChoice &&
                              onUpdateChoice(choice.id, { text: e.target.value })
                            }
                            placeholder="e.g., Follow the stone path"
                            maxLength={STORY_LIMITS.MAX_CHOICE_TEXT_LENGTH}
                            data-testid={`story-choice-text-${choice.id}`}
                          />
                        </div>

                        {/* Choice Destination Selector */}
                        <div className="story-choice-field">
                          <label className="story-choice-label">Destination Scene:</label>
                          <select
                            className="story-select story-select--sm"
                            value={choice.targetSceneId}
                            onChange={(e) =>
                              onUpdateChoice &&
                              onUpdateChoice(choice.id, { targetSceneId: e.target.value })
                            }
                            data-testid={`story-choice-target-${choice.id}`}
                          >
                            {otherScenes.map((s, idx) => (
                              <option key={s.id} value={s.id}>
                                {s.name || `Scene ${idx + 1}`}
                              </option>
                            ))}
                            {!otherScenes.some((s) => s.id === choice.targetSceneId) && (
                              <option value={choice.targetSceneId} disabled>
                                (Missing Scene: {choice.targetSceneId})
                              </option>
                            )}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {otherScenes.length === 0 ? (
                  <p className="story-director-help">
                    Add another scene in the left filmstrip to connect branching choices!
                  </p>
                ) : (
                  <button
                    type="button"
                    className="story-btn story-btn--outline story-btn--sm story-add-choice-btn"
                    onClick={() =>
                      onAddChoice &&
                      onAddChoice({
                        text: `Go to ${otherScenes[0]?.name || "Next Scene"}`,
                        targetSceneId: otherScenes[0]?.id,
                      })
                    }
                    disabled={choices.length >= STORY_LIMITS.MAX_CHOICES_PER_SCENE}
                    data-testid="story-add-choice-btn"
                  >
                    <Plus size={14} aria-hidden="true" />
                    <span>Add Branching Choice ({choices.length}/{STORY_LIMITS.MAX_CHOICES_PER_SCENE})</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}
