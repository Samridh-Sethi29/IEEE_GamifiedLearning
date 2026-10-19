import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FlaskConical } from "lucide-react";
import EditorWorkspace from "@/features/studio/engine/EditorWorkspace";
import { createProject } from "@/features/studio/engine/schema";
import { createDocumentStorage } from "@/features/studio/storage/documentStorage";

// Technical proof of the shared creation engine (Phase C). This is NOT one of the four Creative
// Studio stations: it is reachable by URL only (/world/studio/engine-lab) and is not linked from
// the hub, so no station appears playable because of it. It does not read or write the player
// profile (no XP, coins, levels or skills).

export default function EngineLab() {
  const initialProject = useMemo(() => createProject({ title: "Engine test workspace", type: "sandbox" }), []);
  const storage = useMemo(() => createDocumentStorage(), []);

  return (
    <div className="sce-scope" data-testid="engine-lab">
      <div className="sce-shell">
        <header className="sce-header">
          <Link to="/world/studio" className="sce-back" data-testid="engine-lab-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Creative Studio
          </Link>
          <div className="sce-heading">
            <h1 className="sce-title">
              <FlaskConical size={22} aria-hidden="true" /> Creation Engine Test
            </h1>
            <p className="sce-lead">
              A technical preview of the editing tools the Studio stations will share. Nothing here earns XP or coins.
            </p>
          </div>
        </header>
        <EditorWorkspace initialProject={initialProject} storage={storage} />
      </div>
    </div>
  );
}
