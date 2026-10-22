import React from 'react';

export default function HomeWelcomeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="game-overlay" style={{ zIndex: 110 }}>
      <div className="game-overlay-backdrop" onClick={onClose} />
      <div className="game-panel" style={{ maxWidth: '580px', padding: '0' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            padding: '24px 28px',
            borderTopLeftRadius: '21px',
            borderTopRightRadius: '21px',
            borderBottom: '2px solid rgba(139, 94, 60, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
              }}
            >
              🏡
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#78350F', margin: 0 }}>
                Welcome to Home World!
              </h2>
              <p style={{ fontSize: '13px', color: '#92400E', margin: '4px 0 0 0', fontWeight: 600 }}>
                Explore, play mini-games, and master essential life skills!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="game-close"
            aria-label="Close welcome guide"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div
              style={{
                background: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>🎮 Controls</div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Use <strong>W, A, S, D</strong> or <strong>Arrow Keys</strong> to walk around the house. Use the on-screen D-Pad on touch devices.
              </p>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>⚡ Interactions</div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Walk up to glowing icons and press <strong>E</strong> (or tap) to launch fun interactive mini-games and earn rewards!
              </p>
            </div>
          </div>

          {/* Rooms overview */}
          <div style={{ marginBottom: '22px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
              📍 6 Explorable Rooms & 12 Learning Quests:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { name: '🛋️ Living Room', desc: 'Waste, Power, Tidy' },
                { name: '🍳 Kitchen', desc: 'Nutrition, Spices, Water' },
                { name: '🛏️ Bedroom', desc: 'Routine & Wardrobe' },
                { name: '🚿 Bathroom', desc: 'Laundry & Hygiene' },
                { name: '🌱 Garden', desc: 'Planting & Compost' },
                { name: '🛡️ Safety Corner', desc: 'Hazards & Detective' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#92400E' }}>{item.name}</div>
                  <div style={{ color: '#B45309', fontSize: '10px', marginTop: '2px' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Action */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={onClose}
              className="game-btn game-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '16px' }}
            >
              🚀 Let's Explore the House!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
