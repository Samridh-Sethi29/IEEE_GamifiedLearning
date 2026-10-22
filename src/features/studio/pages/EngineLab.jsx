import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, FlaskConical } from "lucide-react";
import EditorWorkspace from "@/features/studio/engine/EditorWorkspace";
import { createProject } from "@/features/studio/engine/schema";
import { createDocumentStorage } from "@/features/studio/storage/documentStorage";

// Technical proof of the shared creation engine (Phase C). This is NOT one of the four Creative
// Studio stations: it is reachable by URL only (/world/studio/engine-lab) and is not linked from
// the hub, so no station appears playable because of it. It does not read or write the player
// profile (no XP, coins, levels or skills).

export default function EngineLab() {
  const [searchParams] = useSearchParams();
  const rawType = searchParams.get("type");
  const type = rawType === "world-builder" ? "world-builder" : "sandbox";
  const title = type === "world-builder" ? "World Builder workspace" : "Engine test workspace";
  const initialProject = useMemo(() => createProject({ title, type }), [type, title]);
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
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <Link
                to="/world/studio/engine-lab"
                className="sce-btn"
                style={{ textDecoration: "none", padding: "4px 10px", fontSize: "12px", fontWeight: type === "sandbox" ? 700 : 400 }}
                data-testid="engine-lab-type-sandbox"
              >
                Sandbox Mode (6 objects)
              </Link>
              <Link
                to="/world/studio/engine-lab?type=world-builder"
                className="sce-btn"
                style={{ textDecoration: "none", padding: "4px 10px", fontSize: "12px", fontWeight: type === "world-builder" ? 700 : 400 }}
                data-testid="engine-lab-type-world-builder"
              >
                World Builder Mode (7 objects)
              </Link>
            </div>
          </div>
        </header>
        <EditorWorkspace key={type} initialProject={initialProject} storage={storage} />
      </div>
    </div>
  );
}
