// Compact keyboard/touch-friendly menu. Uses the same select handler as the illustrated
// stations, so both routes lead to exactly the same result.
export default function StationNav({ tools, selectedId, onSelect }) {
  return (
    <nav className="studio-nav" aria-label="Creative Studio stations">
      <ul>
        {tools.map(({ id, title, Icon, accent }) => (
          <li key={id}>
            <button
              type="button"
              className="studio-nav-btn"
              data-accent={accent}
              aria-pressed={selectedId === id}
              onClick={() => onSelect(id)}
              data-testid={`studio-nav-${id}`}
            >
              <Icon size={18} aria-hidden="true" />
              {title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
