// Compact secondary navigation: the same select handler as the illustrated zones, for keyboard
// and screen-reader users (and anyone who prefers a plain list).
export default function StationNav({ tools, selectedId, onSelect }) {
  return (
    <nav className="studio-nav" aria-label="Creative Studio zones">
      <ul>
        {tools.map(({ id, title, Icon, accent }, i) => (
          <li key={id}>
            <button type="button" className="studio-nav-btn" data-accent={accent} aria-pressed={selectedId === id} onClick={() => onSelect(id)} data-testid={`studio-nav-${id}`}>
              <span className="studio-nav-n" aria-hidden="true">{i + 1}</span>
              <Icon size={16} aria-hidden="true" />
              <span className="studio-nav-label">{title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
