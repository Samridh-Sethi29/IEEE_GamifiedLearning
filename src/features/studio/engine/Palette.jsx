import CollapsiblePanel from "./CollapsiblePanel.jsx";
import { ObjectPreview } from "./objectArt.jsx";
import { defaultProps, getPaletteObjectTypes, OBJECT_TYPES } from "./objectTypes.js";

export { getPaletteObjectTypes };

export default function Palette({ onAdd, disabled, projectType, doc }) {
  const activeType = projectType ?? doc?.type;
  const types = getPaletteObjectTypes(activeType);

  return (
    <CollapsiblePanel id="sce-palette" title="Palette" className="sce-palette">
      {types.length === 0 ? (
        <p className="sce-hint" data-testid="sce-palette-empty">
          No objects available for this workspace.
        </p>
      ) : (
        <ul className="sce-palette-list">
          {types.map((type) => {
            const def = OBJECT_TYPES[type];
            if (!def || !def.defaultSize || !def.label) {
              console.warn(`[Palette] Object type "${type}" has no presentation definition.`);
              return null;
            }
            const scale = 44 / Math.max(def.defaultSize.width, def.defaultSize.height);
            return (
              <li key={type}>
                <button
                  type="button"
                  className="sce-palette-btn"
                  onClick={() => onAdd(type)}
                  disabled={disabled}
                  aria-label={`Add ${def.label}`}
                  data-testid={`sce-add-${type}`}
                >
                  <ObjectPreview
                    type={type}
                    width={def.defaultSize.width * scale}
                    height={def.defaultSize.height * scale}
                    props={defaultProps(type)}
                  />
                  <span>{def.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </CollapsiblePanel>
  );
}
