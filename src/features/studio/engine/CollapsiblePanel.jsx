import { useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";

// A panel that is always open on wide screens and becomes a collapsible section on phones.
const QUERY = "(max-width: 699px)";
const subscribe = (cb) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useNarrow = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);

export default function CollapsiblePanel({ id, title, className = "", testId, children }) {
  const narrow = useNarrow();
  const [open, setOpen] = useState(true);
  const expanded = !narrow || open;
  return (
    <section className={`sce-panel ${className}`} aria-labelledby={`${id}-title`} data-testid={testId}>
      <h2 id={`${id}-title`} className="sce-panel-title">
        {narrow ? (
          <button type="button" className="sce-collapse" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen((o) => !o)}>
            {title}
            <ChevronDown size={18} aria-hidden="true" className="sce-chevron" data-open={open} />
          </button>
        ) : (
          title
        )}
      </h2>
      <div id={`${id}-body`} className="sce-panel-body" hidden={!expanded}>
        {children}
      </div>
    </section>
  );
}
