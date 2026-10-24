import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Check,
  Copy,
  Eye,
  Film,
  FolderOpen,
  GitFork,
  Library,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import {
  STORY_BACKGROUNDS,
  STORY_CHARACTERS,
  STORY_LIMITS,
} from "../engine/storySchema.js";
import {
  createBlankStoryInLibrary,
  createTemplateStoryInLibrary,
  deleteStoryFromLibrary,
  duplicateStoryInLibrary,
  getStoryFromLibrary,
  loadStoryLibrary,
  renameStoryInLibrary,
  saveStoryToLibrary,
  switchActiveStory,
} from "../engine/storyLibrary.js";
import {
  STARTER_TEMPLATES,
  getAllTemplates,
} from "../data/storyTemplates.js";
import { StoryBackdrop } from "../art/StoryArtComponents.jsx";

/**
 * Story Library and Template Modal (S1.7 & S1.8).
 *
 * Provides:
 * 1. "My Stories" tab:
 *    - Responsive cards for all saved stories
 *    - Thumbnail backdrop from scene 1
 *    - Open / Currently Editing badge
 *    - Rename story with validation
 *    - Deep duplicate with fresh unique IDs
 *    - Delete story with explicit confirmation modal
 *    - Friendly empty state
 * 2. "New Story & Templates" tab:
 *    - "Blank Story" option
 *    - Four starter templates (Mystery of Missing Bucket, Friendship Mix-Up, Tiny Robot, Journey Under Stars)
 *    - Template premise, category, scene count, character chips
 *    - "Preview" modal showing scene breakdown before creating
 *    - "Use Template" button creating a fresh independent document
 */
export default function StoryLibraryModal({
  isOpen,
  onClose,
  storage,
  currentStory,
  onSelectStory,
  onOpenChallenges,
}) {
  const [tab, setTab] = useState("my-stories"); // "my-stories" | "templates"
  const [libraryData, setLibraryData] = useState(() => loadStoryLibrary(storage));
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [deleteConfirmStory, setDeleteConfirmStory] = useState(null);
  const [renameStoryId, setRenameStoryId] = useState(null);
  const [renameTitleInput, setRenameTitleInput] = useState("");

  // Reload library state whenever modal opens or storage changes
  useEffect(() => {
    if (isOpen) {
      // First ensure currentStory is saved in library
      if (currentStory && currentStory.id) {
        saveStoryToLibrary(storage, currentStory, { setActive: true });
      }
      setLibraryData(loadStoryLibrary(storage));
      setDeleteConfirmStory(null);
      setRenameStoryId(null);
      setPreviewTemplate(null);
    }
  }, [isOpen, storage, currentStory]);

  // Handle keyboard: Escape closes preview, confirmation, or the whole modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (deleteConfirmStory) {
          setDeleteConfirmStory(null);
        } else if (previewTemplate) {
          setPreviewTemplate(null);
        } else if (renameStoryId) {
          setRenameStoryId(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, deleteConfirmStory, previewTemplate, renameStoryId, onClose]);

  const stories = libraryData?.stories || [];
  const activeStoryId = libraryData?.activeStoryId || currentStory?.id;

  // --- Handlers: My Stories ---
  const handleOpenStory = (storyId) => {
    const res = switchActiveStory(storage, storyId);
    if (res.ok && res.story) {
      onSelectStory(res.story);
      onClose();
    }
  };

  const handleStartRename = (story, e) => {
    e.stopPropagation();
    setRenameStoryId(story.id);
    setRenameTitleInput(story.title);
  };

  const handleSaveRename = (storyId, e) => {
    e?.preventDefault();
    const trimmed = renameTitleInput.trim().slice(0, STORY_LIMITS.MAX_TITLE_LENGTH);
    if (trimmed) {
      renameStoryInLibrary(storage, storyId, trimmed);
      setLibraryData(loadStoryLibrary(storage));
      // If renamed the currently active story, reload it in workspace
      if (storyId === activeStoryId) {
        const loaded = getStoryFromLibrary(storage, storyId);
        if (loaded.ok) onSelectStory(loaded.story);
      }
    }
    setRenameStoryId(null);
  };

  const handleDuplicate = (storyId, e) => {
    e.stopPropagation();
    const res = duplicateStoryInLibrary(storage, storyId);
    if (res.ok) {
      setLibraryData(loadStoryLibrary(storage));
    }
  };

  const handleDeleteRequest = (story, e) => {
    e.stopPropagation();
    setDeleteConfirmStory(story);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmStory) return;
    const res = deleteStoryFromLibrary(storage, deleteConfirmStory.id);
    if (res.ok) {
      setLibraryData(loadStoryLibrary(storage));
      // If deleted active story and next story activated, notify workspace
      if (deleteConfirmStory.id === activeStoryId && res.nextActiveStory) {
        onSelectStory(res.nextActiveStory);
      }
    }
    setDeleteConfirmStory(null);
  };

  // --- Handlers: New Story & Templates ---
  const handleCreateBlank = () => {
    const res = createBlankStoryInLibrary(storage, {
      title: "Untitled Story",
      author: "Explorer",
    });
    if (res.ok && res.story) {
      setLibraryData(loadStoryLibrary(storage));
      onSelectStory(res.story);
      onClose();
    }
  };

  const handleUseTemplate = (templateId) => {
    const res = createTemplateStoryInLibrary(storage, templateId);
    if (res.ok && res.story) {
      setLibraryData(loadStoryLibrary(storage));
      onSelectStory(res.story);
      setPreviewTemplate(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="story-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-library-title"
      data-testid="story-library-modal"
    >
      <div className="story-modal-dialog story-library-dialog">
        {/* Modal Header */}
        <header className="story-modal-header">
          <div className="story-modal-title-group">
            <Library size={22} className="story-modal-icon" aria-hidden="true" />
            <div>
              <h2 id="story-library-title" className="story-modal-title">
                Story Library
              </h2>
              <p className="story-modal-subtitle">
                Manage your stories or start a new illustrated adventure
              </p>
            </div>
          </div>

          <div className="story-modal-header-actions">
            {/* Navigation Tabs */}
            <nav className="story-modal-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "my-stories"}
                className={`story-modal-tab ${tab === "my-stories" ? "story-modal-tab--active" : ""}`}
                onClick={() => setTab("my-stories")}
                data-testid="story-library-tab-stories"
              >
                <BookOpen size={15} aria-hidden="true" />
                <span>My Stories ({stories.length})</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "templates"}
                className={`story-modal-tab ${tab === "templates" ? "story-modal-tab--active" : ""}`}
                onClick={() => setTab("templates")}
                data-testid="story-library-tab-templates"
              >
                <Sparkles size={15} aria-hidden="true" />
                <span>New Story & Templates</span>
              </button>
            </nav>

            {onOpenChallenges && (
              <button
                type="button"
                className="story-btn story-btn--ghost story-btn--sm"
                onClick={() => {
                  onClose();
                  onOpenChallenges();
                }}
                title="Switch to Challenge Mode"
                data-testid="story-library-open-challenges-btn"
              >
                <Trophy size={14} aria-hidden="true" />
                <span>Challenges</span>
              </button>
            )}

            <button
              type="button"
              className="story-icon-btn story-modal-close"
              onClick={onClose}
              aria-label="Close Story Library"
              data-testid="story-library-close-btn"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Modal Body */}
        <div className="story-modal-body">
          {tab === "my-stories" && (
            <div className="story-library-view" data-testid="story-library-stories-view">
              <div className="story-library-toolbar">
                <span className="story-library-stats">
                  {stories.length} {stories.length === 1 ? "story" : "stories"} saved on this device
                </span>
                <button
                  type="button"
                  className="story-btn story-btn--primary story-btn--sm"
                  onClick={() => setTab("templates")}
                  data-testid="story-library-new-btn"
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>New Story</span>
                </button>
              </div>

              {stories.length === 0 ? (
                <div className="story-library-empty" data-testid="story-library-empty">
                  <BookOpen size={48} className="story-library-empty-icon" aria-hidden="true" />
                  <h3>No Stories Yet</h3>
                  <p>Create your first story from scratch or choose a starter template!</p>
                  <button
                    type="button"
                    className="story-btn story-btn--primary"
                    onClick={() => setTab("templates")}
                    data-testid="story-library-empty-create-btn"
                  >
                    <Plus size={16} aria-hidden="true" />
                    <span>Create Your First Story</span>
                  </button>
                </div>
              ) : (
                <div className="story-library-grid" data-testid="story-library-grid">
                  {stories.map((story) => {
                    const isActive = story.id === activeStoryId;
                    const isRenaming = renameStoryId === story.id;
                    const bgMeta = STORY_BACKGROUNDS[story.firstSceneBackground];
                    const bgLabel = bgMeta?.label || story.firstSceneBackground || "Village Square";
                    const formattedDate = story.modifiedAt
                      ? new Date(story.modifiedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently";

                    return (
                      <div
                        key={story.id}
                        className={`story-library-card ${isActive ? "story-library-card--active" : ""}`}
                        data-testid={`story-library-card-${story.id}`}
                      >
                        {/* Thumbnail Backdrop */}
                        <div
                          className="story-library-card-thumb"
                          onClick={() => handleOpenStory(story.id)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Open story: ${story.title}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleOpenStory(story.id);
                            }
                          }}
                        >
                          <StoryBackdrop background={story.firstSceneBackground || "village-square"} />
                          <div className="story-library-card-thumb-overlay">
                            <span className="story-library-bg-badge">{bgLabel}</span>
                            {isActive && (
                              <span className="story-library-active-badge" data-testid={`story-active-badge-${story.id}`}>
                                <Check size={12} aria-hidden="true" />
                                <span>Currently Open</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Info */}
                        <div className="story-library-card-info">
                          {isRenaming ? (
                            <form
                              className="story-library-rename-form"
                              onSubmit={(e) => handleSaveRename(story.id, e)}
                            >
                              <input
                                type="text"
                                className="story-input story-input--sm"
                                value={renameTitleInput}
                                onChange={(e) => setRenameTitleInput(e.target.value)}
                                autoFocus
                                maxLength={STORY_LIMITS.MAX_TITLE_LENGTH}
                                data-testid={`story-rename-input-${story.id}`}
                              />
                              <button
                                type="submit"
                                className="story-icon-btn story-icon-btn--save"
                                aria-label="Save Title"
                                data-testid={`story-rename-save-${story.id}`}
                              >
                                <Check size={14} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="story-icon-btn story-icon-btn--cancel"
                                onClick={() => setRenameStoryId(null)}
                                aria-label="Cancel Rename"
                              >
                                <X size={14} aria-hidden="true" />
                              </button>
                            </form>
                          ) : (
                            <div className="story-library-card-title-row">
                              <h3
                                className="story-library-card-title"
                                title={story.title}
                                onClick={() => handleOpenStory(story.id)}
                              >
                                {story.title}
                              </h3>
                              <button
                                type="button"
                                className="story-icon-btn"
                                onClick={(e) => handleStartRename(story, e)}
                                title="Rename story"
                                aria-label={`Rename ${story.title}`}
                                data-testid={`story-card-rename-${story.id}`}
                              >
                                <Pencil size={13} aria-hidden="true" />
                              </button>
                            </div>
                          )}

                          <div className="story-library-card-meta">
                            <span className="story-stat-chip" title={`${story.sceneCount} scenes`}>
                              <Film size={12} aria-hidden="true" />
                              <span>{story.sceneCount} {story.sceneCount === 1 ? "scene" : "scenes"}</span>
                            </span>
                            <span className="story-library-date">
                              <Calendar size={12} aria-hidden="true" />
                              <span>{formattedDate}</span>
                            </span>
                          </div>

                          {/* Card Actions */}
                          <div className="story-library-card-actions">
                            <button
                              type="button"
                              className="story-btn story-btn--primary story-btn--sm"
                              onClick={() => handleOpenStory(story.id)}
                              data-testid={`story-card-open-${story.id}`}
                            >
                              <FolderOpen size={14} aria-hidden="true" />
                              <span>{isActive ? "Continue" : "Open"}</span>
                            </button>
                            <button
                              type="button"
                              className="story-icon-btn"
                              onClick={(e) => handleDuplicate(story.id, e)}
                              title="Duplicate story"
                              aria-label={`Duplicate ${story.title}`}
                              data-testid={`story-card-duplicate-${story.id}`}
                            >
                              <Copy size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="story-icon-btn story-icon-btn--danger"
                              onClick={(e) => handleDeleteRequest(story, e)}
                              title="Delete story"
                              aria-label={`Delete ${story.title}`}
                              data-testid={`story-card-delete-${story.id}`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "templates" && (
            <div className="story-templates-view" data-testid="story-templates-view">
              {/* Blank Story Callout */}
              <div className="story-blank-option-card" data-testid="story-template-blank">
                <div className="story-blank-option-content">
                  <div className="story-blank-option-icon">
                    <Plus size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="story-blank-option-title">Start with a Blank Canvas</h3>
                    <p className="story-blank-option-desc">
                      Begin with one empty scene and invent your very own characters, dialogues, and setting.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="story-btn story-btn--primary"
                  onClick={handleCreateBlank}
                  data-testid="story-create-blank-btn"
                >
                  <Plus size={15} aria-hidden="true" />
                  <span>Create Blank Story</span>
                </button>
              </div>

              {/* Starter Templates Header */}
              <div className="story-templates-section-header">
                <div>
                  <h3 className="story-templates-heading">Starter Story Templates</h3>
                  <p className="story-templates-subheading">
                    Jump right into an editable illustrated adventure! Each template includes pre-staged characters, settings, and dialogue.
                  </p>
                </div>
              </div>

              {/* Starter Templates Grid */}
              <div className="story-templates-grid" data-testid="story-templates-grid">
                {STARTER_TEMPLATES.map((tmpl) => {
                  const bgMeta = STORY_BACKGROUNDS[tmpl.firstSceneBackground];
                  const bgLabel = bgMeta?.label || tmpl.firstSceneBackground;

                  return (
                    <div
                      key={tmpl.id}
                      className="story-template-card"
                      data-testid={`story-template-card-${tmpl.id}`}
                    >
                      {/* Template Backdrop Thumbnail */}
                      <div className="story-template-card-thumb">
                        <StoryBackdrop background={tmpl.firstSceneBackground} />
                        <span className="story-template-category-badge">
                          {tmpl.category}
                        </span>
                      </div>

                      {/* Template Content */}
                      <div className="story-template-card-body">
                        <h4 className="story-template-card-title">{tmpl.title}</h4>
                        <p className="story-template-card-premise">{tmpl.premise}</p>

                        <div className="story-template-card-meta">
                          <span className="story-stat-chip">
                            <Film size={12} aria-hidden="true" />
                            <span>{tmpl.sceneCount} scenes</span>
                          </span>

                          <div className="story-template-characters">
                            <Users size={12} aria-hidden="true" />
                            <span>
                              {tmpl.featuredCharacters
                                .map((cId) => STORY_CHARACTERS[cId]?.name || cId)
                                .join(", ")}
                            </span>
                          </div>
                        </div>

                        {/* Template Actions */}
                        <div className="story-template-card-actions">
                          <button
                            type="button"
                            className="story-btn story-btn--outline story-btn--sm"
                            onClick={() => setPreviewTemplate(tmpl)}
                            data-testid={`story-template-preview-btn-${tmpl.id}`}
                          >
                            <Eye size={14} aria-hidden="true" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            className="story-btn story-btn--primary story-btn--sm"
                            onClick={() => handleUseTemplate(tmpl.id)}
                            data-testid={`story-template-use-btn-${tmpl.id}`}
                          >
                            <Sparkles size={14} aria-hidden="true" />
                            <span>Use Template</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirmStory && (
          <div
            className="story-modal-overlay story-modal-overlay--nested"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="story-delete-dialog-title"
            data-testid="story-delete-confirm-dialog"
          >
            <div className="story-modal-dialog story-delete-dialog">
              <div className="story-delete-header">
                <AlertTriangle size={28} className="story-delete-icon" aria-hidden="true" />
                <div>
                  <h3 id="story-delete-dialog-title" className="story-delete-title">
                    Delete Story?
                  </h3>
                  <p className="story-delete-message">
                    Are you sure you want to permanently delete{" "}
                    <strong>"{deleteConfirmStory.title}"</strong>? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="story-delete-actions">
                <button
                  type="button"
                  className="story-btn story-btn--ghost"
                  onClick={() => setDeleteConfirmStory(null)}
                  data-testid="story-delete-cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="story-btn story-btn--danger"
                  onClick={handleConfirmDelete}
                  data-testid="story-delete-confirm-btn"
                  autoFocus
                >
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Delete Story</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Dialog */}
        {previewTemplate && (
          <div
            className="story-modal-overlay story-modal-overlay--nested"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-preview-dialog-title"
            data-testid="story-template-preview-dialog"
          >
            <div className="story-modal-dialog story-template-preview-dialog">
              <header className="story-modal-header">
                <div>
                  <span className="story-template-category-badge">
                    {previewTemplate.category}
                  </span>
                  <h3 id="story-preview-dialog-title" className="story-preview-title">
                    {previewTemplate.title}
                  </h3>
                </div>
                <button
                  type="button"
                  className="story-icon-btn"
                  onClick={() => setPreviewTemplate(null)}
                  aria-label="Close Preview"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </header>

              <div className="story-preview-body">
                <p className="story-preview-premise">
                  {previewTemplate.premise}
                </p>

                <h4 className="story-preview-scenes-heading">
                  Scene Breakdown ({previewTemplate.scenes.length} Scenes)
                </h4>

                <div className="story-preview-scenes-list">
                  {previewTemplate.scenes.map((scene, idx) => {
                    const bgMeta = STORY_BACKGROUNDS[scene.background];
                    return (
                      <div key={idx} className="story-preview-scene-item">
                        <div className="story-preview-scene-thumb">
                          <StoryBackdrop background={scene.background} />
                        </div>
                        <div className="story-preview-scene-details">
                          <h5>
                            Scene {idx + 1}: {scene.name}
                          </h5>
                          <p className="story-preview-scene-setting">
                            Setting: <strong>{bgMeta?.label || scene.background}</strong>
                          </p>
                          <p className="story-preview-scene-narration">
                            "{scene.narration}"
                          </p>
                          <div className="story-preview-scene-cast">
                            <span>Cast:</span>{" "}
                            {scene.characters
                              .map((c) => STORY_CHARACTERS[c.characterId]?.name || c.characterId)
                              .join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <footer className="story-preview-footer">
                <button
                  type="button"
                  className="story-btn story-btn--ghost"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  className="story-btn story-btn--primary"
                  onClick={() => handleUseTemplate(previewTemplate.id)}
                  data-testid="story-preview-use-btn"
                >
                  <Sparkles size={15} aria-hidden="true" />
                  <span>Start Story with this Template</span>
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
