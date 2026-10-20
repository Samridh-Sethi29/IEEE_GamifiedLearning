import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, BookOpen, Hammer, RefreshCw } from "lucide-react";
import EditorWorkspace from "../../engine/EditorWorkspace.jsx";
import {
  createDefaultWorldBuilderProject,
  createWorldBuilderStorage,
  loadWorldBuilderProject,
} from "../engine/worldBuilderWorkspaceModel.js";
import { MISSION } from "../data/mission.js";
import { STUDIO_CSS_VARS } from "../../art/palette.js";
import WorldBuilderGuide from "./WorldBuilderGuide.jsx";
import "../world-builder.css";

/**
 * Dedicated World Builder editing workspace.
 * Connects the shared creation engine with the World Builder project type,
 * existing water-port overlay, and persistent project storage.
 * Strictly isolated from player profile progression.
 */
export default function WorldBuilderWorkspace({ onBack }) {
  const storage = useMemo(() => createWorldBuilderStorage(), []);
  const [editorKey, setEditorKey] = useState(1);
  // Guide state lives here, outside EditorWorkspace, so opening / minimizing / closing the guide can
  // never reset or remount the village design. Short screens start with the slim banner so the
  // editor gets the room; taller screens start expanded.
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const [isGuideMinimized, setIsGuideMinimized] = useState(
    () => typeof window !== "undefined" && window.innerHeight > 0 && window.innerHeight < 720
  );
  const [initialLoad] = useState(() => loadWorldBuilderProject(storage));
  const [project, setProject] = useState(() => initialLoad.project || createDefaultWorldBuilderProject());
  const [loadError, setLoadError] = useState(() =>
    initialLoad.ok
      ? null
      : {
          code: initialLoad.code,
          message: initialLoad.message,
          version: initialLoad.version,
        }
  );

  const hasBackup = Boolean(storage && typeof storage.hasBackup === "function" && storage.hasBackup());

  const handleRetryLoad = () => {
    const res = loadWorldBuilderProject(storage);
    if (res.ok) {
      setProject(res.project);
      setLoadError(null);
      setEditorKey((k) => k + 1);
    } else {
      setLoadError({
        code: res.code,
        message: res.message,
        version: res.version,
      });
    }
  };

  const handleRestoreBackup = () => {
    const confirmed =
      typeof window === "undefined" || !window.confirm
        ? true
        : window.confirm("Restore village design from the backup copy?");
    if (!confirmed) return;

    if (storage && typeof storage.restoreBackup === "function") {
      const res = storage.restoreBackup();
      if (res.ok && res.project) {
        setProject(res.project);
        setLoadError(null);
        setEditorKey((k) => k + 1);
      } else {
        setLoadError({
          code: res.code || "restore_failed",
          message: `Could not restore backup: ${res.message || "Unknown error"}`,
        });
      }
    }
  };

  const handleStartFresh = () => {
    const confirmed =
      typeof window === "undefined" || !window.confirm
        ? true
        : window.confirm(
            "Start a clean village design? Your unreadable saved file will remain untouched on this device until you explicitly click Save."
          );
    if (!confirmed) return;

    setProject(createDefaultWorldBuilderProject());
    setLoadError(null);
    setEditorKey((k) => k + 1);
  };

  return (
    <div className="sce-scope wb-editor-scope" style={STUDIO_CSS_VARS} data-testid="world-builder-workspace">
      <div className="sce-shell">
        <header className="sce-header">
          <button
            type="button"
            className="sce-back"
            onClick={onBack}
            data-testid="world-builder-back-to-briefing"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Mission Briefing
          </button>
          <div className="sce-heading">
            <div className="wb-header-title-row">
              <h1 className="sce-title">
                <Hammer size={22} aria-hidden="true" /> {MISSION.title} — Construction Workspace
              </h1>
              <button
                type="button"
                className="wb-guide-toggle-btn"
                onClick={() => {
                  setIsGuideOpen((prev) => !prev);
                  setIsGuideMinimized(false);
                }}
                data-testid="wb-guide-toggle-btn"
                aria-expanded={isGuideOpen}
              >
                <BookOpen size={15} aria-hidden="true" />
                {isGuideOpen ? "Hide Guide" : "How to Build Guide"}
              </button>
            </div>
            <p className="sce-lead">
              Design a better water system for the village. Connect the well, pipes, and farms.
            </p>
          </div>
        </header>

        {loadError && (
          <div
            className="wb-storage-recovery-banner"
            role="alert"
            data-testid="wb-storage-recovery-banner"
          >
            <div className="wb-storage-recovery-content">
              <AlertTriangle className="wb-storage-recovery-icon" size={24} aria-hidden="true" />
              <div className="wb-storage-recovery-text">
                <strong className="wb-storage-recovery-title" data-testid="wb-storage-recovery-title">
                  Unable to Load Saved Village Design
                </strong>
                <p className="wb-storage-recovery-desc" data-testid="wb-storage-recovery-desc">
                  {loadError.message}
                </p>
                <p className="wb-storage-recovery-sub">
                  Your saved file on this device has NOT been replaced or overwritten. You can retry loading, restore an earlier backup if one exists, or choose to start fresh.
                </p>
              </div>
            </div>
            <div className="wb-storage-recovery-actions">
              <button
                type="button"
                className="wb-storage-recovery-btn wb-storage-recovery-retry"
                onClick={handleRetryLoad}
                data-testid="wb-storage-retry-btn"
              >
                <RefreshCw size={15} aria-hidden="true" /> Retry Loading
              </button>
              {hasBackup && (
                <button
                  type="button"
                  className="wb-storage-recovery-btn wb-storage-recovery-restore"
                  onClick={handleRestoreBackup}
                  data-testid="wb-storage-restore-backup-btn"
                >
                  Restore from Backup
                </button>
              )}
              <button
                type="button"
                className="wb-storage-recovery-btn wb-storage-recovery-fresh"
                onClick={handleStartFresh}
                data-testid="wb-storage-start-fresh-btn"
              >
                Start Clean Village
              </button>
            </div>
          </div>
        )}

        {isGuideOpen && (
          <WorldBuilderGuide
            isMinimized={isGuideMinimized}
            onMinimizedChange={setIsGuideMinimized}
            onDismiss={() => setIsGuideOpen(false)}
          />
        )}

        <EditorWorkspace
          key="world-builder"
          initialProject={project}
          storage={storage}
          onBackToBriefing={onBack}
        />
      </div>
    </div>
  );
}
