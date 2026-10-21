import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Film,
  Flag,
  GitFork,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { STORY_BACKGROUNDS, STORY_LIMITS } from "../engine/storySchema.js";

/**
 * Left-hand Filmstrip Scene Navigator for Story Studio (S1.3).
 *
 * Allows players to:
 * - View all scenes with active scene highlighting
 * - Add a scene (up to 12)
 * - Rename scenes with inline editing and length validation
 * - Duplicate scenes with brand new unique IDs
 * - Reorder scenes up/down with boundaries disabled
 * - Delete scenes with confirmation (protecting the final scene)
 */
export default function SceneNavigator({
  scenes = [],
  selectedSceneId = null,
  onSelectScene,
  onAddScene,
  onRenameScene,
  onDuplicateScene,
  onDeleteScene,
  onMoveSceneUp,
  onMoveSceneDown,
  canAdd = true,
  canDelete = false,
}) {
  const [editingSceneId, setEditingSceneId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const startRename = (scene, e) => {
    e?.stopPropagation();
    setEditingSceneId(scene.id);
    setDraftName(scene.name);
    setDeleteConfirmId(null);
  };

  const cancelRename = (e) => {
    e?.stopPropagation();
    setEditingSceneId(null);
    setDraftName("");
  };

  const handleRenameSubmit = (sceneId, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = draftName.trim();
    if (trimmed && onRenameScene) {
      onRenameScene(sceneId, trimmed);
    }
    setEditingSceneId(null);
    setDraftName("");
  };

  const handleDeleteRequest = (scene, e) => {
    e?.stopPropagation();
    if (!canDelete) return;

    // If scene has characters or dialogue, prompt with confirmation banner
    if (scene.characters?.length > 0 || scene.dialogue?.length > 0) {
      setDeleteConfirmId(scene.id);
    } else {
      // Empty scene can be deleted directly
      onDeleteScene(scene.id);
      setDeleteConfirmId(null);
    }
  };

  const handleConfirmDelete = (sceneId, e) => {
    e?.stopPropagation();
    onDeleteScene(sceneId);
    setDeleteConfirmId(null);
  };

  return (
    <aside
      className="story-nav"
      aria-label="Story Scenes"
      data-testid="story-scene-navigator"
    >
      <header className="story-nav-header">
        <div className="story-nav-title-group">
          <Film size={18} aria-hidden="true" className="story-nav-icon" />
          <h2 className="story-nav-title">Scenes</h2>
          <span
            className="story-nav-badge"
            data-testid="story-scene-count-badge"
            aria-label={`${scenes.length} of ${STORY_LIMITS.MAX_SCENES} scenes`}
          >
            {scenes.length} / {STORY_LIMITS.MAX_SCENES}
          </span>
        </div>

        <div className="story-nav-header-actions">
          <button
            type="button"
            className="story-btn story-btn--primary story-btn--sm"
            onClick={onAddScene}
            disabled={!canAdd}
            aria-label={
              canAdd ? "Add new scene" : "Maximum of 12 scenes reached"
            }
            title={
              canAdd ? "Add Scene" : "Maximum of 12 scenes reached"
            }
            data-testid="story-add-scene-btn"
          >
            <Plus size={16} aria-hidden="true" />
            <span>New Scene</span>
          </button>
          <button
            type="button"
            className="story-icon-btn story-nav-collapse-btn"
            onClick={() => setIsCollapsed((c) => !c)}
            aria-expanded={!isCollapsed}
            aria-controls="story-filmstrip"
            aria-label={isCollapsed ? "Expand scenes list" : "Collapse scenes list"}
            title={isCollapsed ? "Expand scenes" : "Collapse scenes"}
            data-testid="story-nav-collapse-btn"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </header>

      <ol
        id="story-filmstrip"
        className="story-filmstrip"
        role="list"
        data-testid="story-filmstrip"
        hidden={isCollapsed}
      >
        {scenes.map((scene, index) => {
          const isActive = scene.id === selectedSceneId;
          const bgMeta = STORY_BACKGROUNDS[scene.background];
          const bgLabel = bgMeta?.label || scene.background;
          const isEditing = editingSceneId === scene.id;
          const isConfirmingDelete = deleteConfirmId === scene.id;

          return (
            <li
              key={scene.id}
              className={`story-filmstrip-card ${
                isActive ? "story-filmstrip-card--active" : ""
              }`}
              data-testid={`story-scene-card-${scene.id}`}
              aria-current={isActive ? "true" : undefined}
            >
              {/* Card Top: Number & Title/Rename */}
              <div className="story-card-top">
                <span
                  className="story-card-number"
                  aria-hidden="true"
                  data-testid={`story-scene-number-${scene.id}`}
                >
                  {index + 1}
                </span>

                {isEditing ? (
                  <form
                    onSubmit={(e) => handleRenameSubmit(scene.id, e)}
                    className="story-rename-form"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      className="story-rename-input"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") cancelRename(e);
                      }}
                      maxLength={STORY_LIMITS.MAX_SCENE_NAME_LENGTH}
                      autoFocus
                      aria-label="Scene name"
                      data-testid={`story-rename-input-${scene.id}`}
                    />
                    <button
                      type="submit"
                      className="story-icon-btn story-icon-btn--save"
                      aria-label="Save scene name"
                      title="Save name"
                      data-testid={`story-rename-save-${scene.id}`}
                    >
                      <Check size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="story-icon-btn story-icon-btn--cancel"
                      onClick={cancelRename}
                      aria-label="Cancel rename"
                      title="Cancel"
                      data-testid={`story-rename-cancel-${scene.id}`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  <div className="story-card-title-row">
                    <button
                      type="button"
                      className="story-card-title-btn"
                      onClick={() => onSelectScene(scene.id)}
                      aria-label={`Select ${scene.name}`}
                      title={`Select ${scene.name}`}
                      data-testid={`story-scene-select-${scene.id}`}
                    >
                      <span className="story-card-title-text">{scene.name}</span>
                    </button>
                    <button
                      type="button"
                      className="story-icon-btn"
                      onClick={(e) => startRename(scene, e)}
                      aria-label={`Rename ${scene.name}`}
                      title="Rename scene"
                      data-testid={`story-scene-rename-btn-${scene.id}`}
                    >
                      <Pencil size={13} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body: Thumbnail & Summary */}
              <button
                type="button"
                className="story-card-thumb"
                onClick={() => onSelectScene(scene.id)}
                aria-label={`Select Scene ${index + 1}: ${scene.name}`}
                data-testid={`story-scene-thumb-${scene.id}`}
              >
                <div
                  className="story-card-thumb-canvas"
                  data-theme={bgMeta?.theme || "outdoors"}
                >
                  <span className="story-card-bg-pill">{bgLabel}</span>
                </div>

                <div className="story-card-stats">
                  <span
                    className="story-stat-chip"
                    title={`${scene.characters?.length || 0} characters`}
                  >
                    <Users size={12} aria-hidden="true" />
                    <span>{scene.characters?.length || 0}</span>
                  </span>
                  <span
                    className="story-stat-chip"
                    title={`${scene.dialogue?.length || 0} dialogue lines`}
                  >
                    <MessageSquare size={12} aria-hidden="true" />
                    <span>{scene.dialogue?.length || 0}</span>
                  </span>
                  {scene.choices && scene.choices.length > 0 && (
                    <span
                      className="story-stat-chip story-stat-chip--branch"
                      title={`${scene.choices.length} choices`}
                      data-testid={`story-scene-branch-badge-${scene.id}`}
                    >
                      <GitFork size={12} aria-hidden="true" />
                      <span>{scene.choices.length}</span>
                    </span>
                  )}
                  {scene.isEnding && (
                    <span
                      className="story-stat-chip story-stat-chip--ending"
                      title="Ending Scene"
                      data-testid={`story-scene-ending-badge-${scene.id}`}
                    >
                      <Flag size={12} aria-hidden="true" />
                      <span>End</span>
                    </span>
                  )}
                </div>
              </button>

              {/* Delete Confirmation Alert Banner */}
              {isConfirmingDelete && (
                <div
                  className="story-delete-banner"
                  role="alert"
                  data-testid={`story-delete-confirm-banner-${scene.id}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="story-delete-banner-text">Delete this scene?</p>
                  <div className="story-delete-banner-actions">
                    <button
                      type="button"
                      className="story-btn story-btn--danger story-btn--xs"
                      onClick={(e) => handleConfirmDelete(scene.id, e)}
                      data-testid={`story-delete-confirm-btn-${scene.id}`}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="story-btn story-btn--secondary story-btn--xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(null);
                      }}
                      data-testid={`story-delete-cancel-btn-${scene.id}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Card Actions: Move, Duplicate, Delete */}
              <div
                className="story-card-actions"
                role="toolbar"
                aria-label={`Actions for ${scene.name}`}
              >
                <button
                  type="button"
                  className="story-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSceneUp(scene.id);
                  }}
                  disabled={index === 0}
                  aria-label={`Move ${scene.name} up`}
                  title="Move Up"
                  data-testid={`story-move-up-${scene.id}`}
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="story-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveSceneDown(scene.id);
                  }}
                  disabled={index === scenes.length - 1}
                  aria-label={`Move ${scene.name} down`}
                  title="Move Down"
                  data-testid={`story-move-down-${scene.id}`}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="story-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateScene(scene.id);
                  }}
                  disabled={!canAdd}
                  aria-label={`Duplicate ${scene.name}`}
                  title={
                    canAdd ? "Duplicate Scene" : "Maximum 12 scenes reached"
                  }
                  data-testid={`story-duplicate-${scene.id}`}
                >
                  <Copy size={14} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="story-action-btn story-action-btn--danger"
                  onClick={(e) => handleDeleteRequest(scene, e)}
                  disabled={!canDelete}
                  aria-label={`Delete ${scene.name}`}
                  title={
                    canDelete
                      ? "Delete Scene"
                      : "A story must have at least 1 scene"
                  }
                  data-testid={`story-delete-${scene.id}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
