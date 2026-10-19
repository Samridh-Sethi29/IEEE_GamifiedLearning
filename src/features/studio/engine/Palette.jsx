import CollapsiblePanel from "./CollapsiblePanel.jsx";
import { ObjectPreview } from "./objectArt.jsx";
import { defaultProps, OBJECT_TYPES, OBJECT_TYPE_IDS } from "./objectTypes.js";

export default function Palette({ onAdd, disabled }) {
  return (
    <CollapsiblePanel id="sce-palette" title="Palette" className="sce-palette">
      <ul className="sce-palette-list">
        {OBJECT_TYPE_IDS.map((type) => {
          const def = OBJECT_TYPES[type];
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
    </CollapsiblePanel>
  );
}
