import React, { useState } from 'react';
import {
  STATIONS,
  WASTE_ITEMS,
  WEATHER_SCENARIOS,
  CLOTHING_ITEMS,
  SPICE_DATA,
  ELECTRICITY_ITEMS,
  WATER_SCENARIOS,
  CLEAN_ITEMS,
  FOOD_ITEMS,
  FOOD_CATEGORIES,
  PLANT_STEPS,
  COMPOST_ITEMS,
  LAUNDRY_ITEMS,
  SAFETY_SCENARIOS,
  SHOPPING_DATA,
  ROUTINE_STEPS,
} from '../data/homeData';

export default function HomeMiniGames({
  gameId,
  onClose,
  onComplete,
  onEarnRewards,
}) {
  const station = STATIONS.find((s) => s.game === gameId) || STATIONS[0];
  const [completed, setCompleted] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const handleFinish = (bonusCoins = 0, bonusXp = 0) => {
    if (rewardClaimed) return;
    setRewardClaimed(true);
    setCompleted(true);
    const coins = station.coins + bonusCoins;
    const xp = station.xp + bonusXp;
    onEarnRewards({ coins, xp, skill: 'life' });
    onComplete(gameId);
  };

  return (
    <div className="game-overlay">
      <div className="game-overlay-backdrop" onClick={onClose} />
      <div className="game-panel">
        {/* Modal Header */}
        <div className="game-header">
          <div className="game-title">
            <div className="game-title-icon" style={{ background: '#FEF3C7', border: '2px solid #FDE68A' }}>
              {station.icon}
            </div>
            <div>
              <h2>{station.label}</h2>
              <p>Home Life Skills Quest • +{station.coins}🪙 +{station.xp}XP</p>
            </div>
          </div>
          <button className="game-close" onClick={onClose} aria-label="Close Game">
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="game-body">
          {completed ? (
            <CompletionView
              station={station}
              onClose={onClose}
            />
          ) : (
            <>
              {gameId === 'waste' && <WasteGame onFinish={handleFinish} />}
              {gameId === 'electricity' && <ElectricityGame onFinish={handleFinish} />}
              {gameId === 'clean' && <CleanGame onFinish={handleFinish} />}
              {gameId === 'food' && <FoodGame onFinish={handleFinish} />}
              {gameId === 'spice' && <SpiceGame onFinish={handleFinish} />}
              {gameId === 'water' && <WaterGame onFinish={handleFinish} />}
              {gameId === 'shopping' && <ShoppingGame onFinish={handleFinish} />}
              {gameId === 'weather' && <WeatherGame onFinish={handleFinish} />}
              {gameId === 'routine' && <RoutineGame onFinish={handleFinish} />}
              {gameId === 'laundry' && <LaundryGame onFinish={handleFinish} />}
              {gameId === 'plant' && <PlantGame onFinish={handleFinish} />}
              {gameId === 'safety_game' && <SafetyGame onFinish={handleFinish} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Completion View ───────────────────────────────────────────
function CompletionView({ station, onClose }) {
  return (
    <div className="completion-screen">
      <div className="completion-stars">⭐⭐⭐</div>
      <h2 className="completion-title">Splendid Job, Explorer!</h2>
      <p className="completion-subtitle">
        You successfully completed <strong>{station.label}</strong> and learned a valuable life skill for home!
      </p>

      <div className="completion-rewards">
        <div className="reward-badge reward-coins">
          <span>🪙 +{station.coins} Coins</span>
        </div>
        <div className="reward-badge reward-xp">
          <span>⚡ +{station.xp} Life XP</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="game-btn game-btn-primary"
        style={{ padding: '12px 32px', fontSize: '15px' }}
      >
        ✨ Continue Exploring
      </button>
    </div>
  );
}

// ── 1. WASTE SORTING GAME ─────────────────────────────────────
function WasteGame({ onFinish }) {
  const [items, setItems] = useState(() => WASTE_ITEMS.slice(0, 6));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentItem = items[currentIndex];

  const handleBin = (binType) => {
    if (!currentItem) return;
    const isCorrect = currentItem.bin === binType;

    if (isCorrect) {
      setFeedback({
        type: 'correct',
        title: 'Spot on! Correct bin!',
        message: currentItem.fact,
      });
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 >= items.length) {
          onFinish();
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 1400);
    } else {
      setFeedback({
        type: 'wrong',
        title: 'Not quite the right bin!',
        message: `Think carefully: Is ${currentItem.name} organic wet waste, recyclable dry waste, or e-waste?`,
      });
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(currentIndex / items.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{currentIndex} of {items.length} Sorted</span>
      </div>

      {currentItem && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Where does this item belong?</p>
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 28px',
              background: '#FFF',
              border: '3px solid #E2E8F0',
              borderRadius: '20px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: '56px', lineHeight: 1 }}>{currentItem.emoji}</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', marginTop: '8px' }}>
              {currentItem.name}
            </span>
          </div>
        </div>
      )}

      {/* 3 Bins */}
      <div className="game-bins">
        <div
          className="game-bin"
          onClick={() => handleBin('wet')}
          style={{ borderColor: '#22c55e', background: '#f0fdf4' }}
        >
          <div className="game-bin-emoji">🟢</div>
          <div className="game-bin-name" style={{ color: '#15803d' }}>Wet Waste</div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>Food scraps, peels, organic</div>
        </div>

        <div
          className="game-bin"
          onClick={() => handleBin('dry')}
          style={{ borderColor: '#3b82f6', background: '#eff6ff' }}
        >
          <div className="game-bin-emoji">🔵</div>
          <div className="game-bin-name" style={{ color: '#1d4ed8' }}>Dry Waste</div>
          <div style={{ fontSize: '11px', color: '#1e40af', marginTop: '4px' }}>Paper, plastic, glass, clean boxes</div>
        </div>

        <div
          className="game-bin"
          onClick={() => handleBin('ewaste')}
          style={{ borderColor: '#ef4444', background: '#fef2f2' }}
        >
          <div className="game-bin-emoji">🔴</div>
          <div className="game-bin-name" style={{ color: '#b91c1c' }}>E-Waste</div>
          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px' }}>Batteries, wires, electronics</div>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '✅' : '💡'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 2. SAVE ELECTRICITY GAME ──────────────────────────────────
function ElectricityGame({ onFinish }) {
  const [items, setItems] = useState(() =>
    ELECTRICITY_ITEMS.map((item) => ({ ...item, isOff: false }))
  );
  const [feedback, setFeedback] = useState(null);

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isOff: !i.isOff } : i))
    );
  };

  const handleCheck = () => {
    // Check if player turned off energy wasters (shouldOff === true)
    // and left essentials ON (shouldOff === false -> isOff should be false)
    const mistakes = items.filter(
      (i) => (i.shouldOff && !i.isOff) || (!i.shouldOff && i.isOff)
    );

    if (mistakes.length === 0) {
      setFeedback({
        type: 'correct',
        title: 'Energy Master!',
        message: 'You turned off all unnecessary appliances while keeping essentials (like the fridge) running!',
      });
      setTimeout(() => onFinish(), 1500);
    } else {
      const hint = mistakes[0];
      setFeedback({
        type: 'wrong',
        title: 'Check again!',
        message: `${hint.name}: ${hint.reason}`,
      });
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
        Tap appliances to switch them <strong>OFF</strong> if they are wasting electricity. Keep essential appliances <strong>ON</strong>!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            style={{
              padding: '14px 10px',
              borderRadius: '16px',
              border: item.isOff ? '2px solid #94A3B8' : '2px solid #F59E0B',
              background: item.isOff ? '#F1F5F9' : '#FFFBEB',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              opacity: item.isOff ? 0.65 : 1,
            }}
          >
            <div style={{ fontSize: '32px' }}>{item.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B', marginTop: '6px' }}>
              {item.name}
            </div>
            <div
              style={{
                marginTop: '8px',
                fontSize: '11px',
                fontWeight: 800,
                color: item.isOff ? '#64748B' : '#D97706',
              }}
            >
              {item.isOff ? '⚪ SWITCHED OFF' : '⚡ POWER ON'}
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '14px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '💡' : '⚠️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '18px' }}>
        <button onClick={handleCheck} className="game-btn game-btn-primary">
          Check Energy Conservation 🔌
        </button>
      </div>
    </div>
  );
}

// ── 3. CLEAN & ORGANISE GAME ──────────────────────────────────
function CleanGame({ onFinish }) {
  const [items, setItems] = useState(() => CLEAN_ITEMS.slice(0, 6));
  const [selectedItem, setSelectedItem] = useState(null);
  const [placed, setPlaced] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const targets = [
    { id: 'bookshelf', label: 'Bookshelf', emoji: '📚' },
    { id: 'toybox', label: 'Toy Box', emoji: '🧸' },
    { id: 'laundry', label: 'Laundry Basket', emoji: '🧺' },
    { id: 'shoerack', label: 'Shoe Rack', emoji: '👟' },
  ];

  const handlePlace = (targetId) => {
    if (!selectedItem) return;
    if (selectedItem.target === targetId) {
      const nextPlaced = [...placed, selectedItem.id];
      setPlaced(nextPlaced);
      setSelectedItem(null);
      setFeedback({ type: 'correct', title: 'Neat & Tidy!', message: `Put ${selectedItem.name} away cleanly.` });
      setTimeout(() => {
        setFeedback(null);
        if (nextPlaced.length >= items.length) {
          onFinish();
        }
      }, 800);
    } else {
      setFeedback({ type: 'wrong', title: 'Oops!', message: `That item doesn't go there! Try another spot.` });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const remainingItems = items.filter((i) => !placed.includes(i.id));

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(placed.length / items.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{placed.length} of {items.length} Organized</span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '10px' }}>
        1. Select a scattered item. 2. Click the container where it belongs!
      </p>

      {/* Scattered items */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '60px', padding: '10px', background: '#F8FAFC', borderRadius: '16px', marginBottom: '16px' }}>
        {remainingItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className={`sortable-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
            style={{
              borderColor: selectedItem?.id === item.id ? '#F59E0B' : '#E2E8F0',
              background: selectedItem?.id === item.id ? '#FEF3C7' : '#FFFFFF',
            }}
          >
            <span>{item.emoji}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Target drop zones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {targets.map((tgt) => (
          <div
            key={tgt.id}
            onClick={() => handlePlace(tgt.id)}
            style={{
              padding: '16px',
              borderRadius: '16px',
              border: '2px dashed #94A3B8',
              background: '#FFFFFF',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: '36px' }}>{tgt.emoji}</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
              {tgt.label}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Tap to store here</div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '14px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '✨' : '❌'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 4. HEALTHY FOOD SORT GAME ─────────────────────────────────
function FoodGame({ onFinish }) {
  const [foods] = useState(() => FOOD_ITEMS.slice(0, 8));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentFood = foods[currentIndex];

  const handlePickCategory = (catId) => {
    if (!currentFood) return;
    const isCorrect = currentFood.category === catId;

    if (isCorrect) {
      setFeedback({ type: 'correct', title: 'Nutritious Choice!', message: `${currentFood.name} belongs to ${currentFood.group}.` });
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 >= foods.length) {
          onFinish();
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 1000);
    } else {
      setFeedback({ type: 'wrong', title: 'Try again!', message: `Look closer at what ${currentFood.name} is made of.` });
      setTimeout(() => setFeedback(null), 1400);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(currentIndex / foods.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{currentIndex} of {foods.length} Sorted</span>
      </div>

      {currentFood && (
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <div style={{ fontSize: '56px', lineHeight: 1 }}>{currentFood.emoji}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '6px' }}>
            {currentFood.name}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>Which food group does this belong to?</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
        {FOOD_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handlePickCategory(cat.id)}
            className="option-btn"
            style={{ textAlign: 'center', padding: '12px 8px' }}
          >
            <div style={{ fontSize: '24px' }}>{cat.emoji}</div>
            <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>{cat.name}</div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '14px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '🥗' : '🍎'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 5. SPICE DISCOVERY GAME ───────────────────────────────────
function SpiceGame({ onFinish }) {
  const [spices] = useState(() => SPICE_DATA.slice(0, 5));
  const [index, setIndex] = useState(0);
  const [discovered, setDiscovered] = useState([]);

  const spice = spices[index];

  const handleNext = () => {
    if (!discovered.includes(spice.id)) {
      setDiscovered([...discovered, spice.id]);
    }
    if (index + 1 >= spices.length) {
      onFinish();
    } else {
      setIndex((i) => i + 1);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${((index + 1) / spices.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{index + 1} of {spices.length} Spices</span>
      </div>

      <div
        style={{
          background: '#FFFBEB',
          border: '2px solid #FDE68A',
          borderRadius: '24px',
          padding: '24px',
          margin: '16px auto',
          maxWidth: '440px',
        }}
      >
        <div style={{ fontSize: '64px', lineHeight: 1 }}>{spice.emoji}</div>
        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#78350F', marginTop: '10px' }}>
          {spice.name}
        </h3>
        <div style={{ display: 'inline-block', background: '#FEF3C7', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, color: '#92400E', margin: '8px 0 14px' }}>
          Common in: {spice.dish}
        </div>
        <p style={{ fontSize: '14px', color: '#451A03', lineHeight: 1.5, margin: 0 }}>
          {spice.fact}
        </p>
      </div>

      <button onClick={handleNext} className="game-btn game-btn-primary" style={{ padding: '12px 28px' }}>
        {index + 1 >= spices.length ? 'Complete Discovery! 🫙' : 'Next Spice ➡️'}
      </button>
    </div>
  );
}

// ── 6. SAVE WATER GAME ────────────────────────────────────────
function WaterGame({ onFinish }) {
  const [scenarios] = useState(() => WATER_SCENARIOS.slice(0, 4));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const scenario = scenarios[index];

  const handlePick = (optIdx) => {
    if (optIdx === scenario.correct) {
      setFeedback({ type: 'correct', title: 'Water Hero!', message: scenario.fact });
      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= scenarios.length) {
          onFinish();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1800);
    } else {
      setFeedback({ type: 'wrong', title: 'Water Wasted!', message: 'That choice uses too much water. Try another answer!' });
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(index / scenarios.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">Scenario {index + 1} of {scenarios.length}</span>
      </div>

      <div style={{ margin: '16px 0', padding: '16px', background: '#EFF6FF', borderRadius: '18px', border: '2px solid #BFDBFE' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>💧</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
          {scenario.question}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenario.options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)} className="option-btn">
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '14px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '💧' : '❌'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 7. SMART SHOPPING GAME ────────────────────────────────────
function ShoppingGame({ onFinish }) {
  const [cart, setCart] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const totalSpent = cart.reduce((sum, item) => sum + item.price, 0);
  const remainingBudget = SHOPPING_DATA.budget - totalSpent;

  const toggleCart = (item) => {
    if (cart.some((c) => c.id === item.id)) {
      setCart(cart.filter((c) => c.id !== item.id));
    } else {
      if (totalSpent + item.price > SHOPPING_DATA.budget) {
        setFeedback({ type: 'wrong', title: 'Over Budget!', message: 'You don\'t have enough coins left for this item!' });
        setTimeout(() => setFeedback(null), 1400);
        return;
      }
      setCart([...cart, item]);
    }
  };

  const handleCheckout = () => {
    const essentialItems = SHOPPING_DATA.items.filter((i) => i.needed);
    const missingEssentials = essentialItems.filter((ess) => !cart.some((c) => c.id === ess.id));

    if (missingEssentials.length > 0) {
      setFeedback({
        type: 'wrong',
        title: 'Missing Essentials!',
        message: `Your family still needs essential items: ${missingEssentials.map((m) => m.name).join(', ')}.`,
      });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({
        type: 'correct',
        title: 'Budget Master!',
        message: `Great shopping! You bought all essentials for the household and saved ${remainingBudget} coins!`,
      });
      setTimeout(() => onFinish(10, 5), 1800);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '12px 18px', borderRadius: '16px', marginBottom: '14px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Grocery Budget: </span>
          <strong style={{ fontSize: '16px', color: '#1E293B' }}>{SHOPPING_DATA.budget}🪙</strong>
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Remaining: </span>
          <strong style={{ fontSize: '16px', color: remainingBudget >= 0 ? '#15803D' : '#DC2626' }}>
            {remainingBudget}🪙
          </strong>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px' }}>
        Tap items to add to cart. Make sure you buy all essential groceries within budget!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', maxHeight: '42vh', overflowY: 'auto' }}>
        {SHOPPING_DATA.items.map((item) => {
          const inCart = cart.some((c) => c.id === item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCart(item)}
              style={{
                padding: '10px',
                borderRadius: '14px',
                border: inCart ? '2px solid #22C55E' : '2px solid #E2E8F0',
                background: inCart ? '#F0FDF4' : '#FFFFFF',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '28px' }}>{item.emoji}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E293B', marginTop: '4px' }}>{item.name}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{item.price}🪙</div>
              {item.needed && (
                <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '6px', fontWeight: 800 }}>
                  Essential
                </span>
              )}
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '12px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '🛒' : '⚠️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={handleCheckout} className="game-btn game-btn-primary">
          Complete Shopping 🛒
        </button>
      </div>
    </div>
  );
}

// ── 8. DRESS FOR WEATHER GAME ─────────────────────────────────
function WeatherGame({ onFinish }) {
  const [scenarios] = useState(() => WEATHER_SCENARIOS);
  const [index, setIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const scenario = scenarios[index];

  const toggleItem = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleCheck = () => {
    const hasWrong = selectedItems.some((id) => !scenario.correct.includes(id));
    const hasEnoughCorrect = scenario.correct.filter((id) => selectedItems.includes(id)).length >= 3;

    if (!hasWrong && hasEnoughCorrect) {
      setFeedback({ type: 'correct', title: 'Dressed Appropriately!', message: scenario.explanation });
      setTimeout(() => {
        setFeedback(null);
        setSelectedItems([]);
        if (index + 1 >= scenarios.length) {
          onFinish();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1600);
    } else {
      setFeedback({
        type: 'wrong',
        title: 'Check the forecast!',
        message: `It is ${scenario.temp} (${scenario.name}). Choose clothes that protect from this weather.`,
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', background: '#EFF6FF', padding: '16px', borderRadius: '18px', border: '2px solid #BFDBFE', marginBottom: '14px' }}>
        <div style={{ fontSize: '36px' }}>{scenario.emoji}</div>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#1E3A8A', margin: '4px 0' }}>
          {scenario.name} • {scenario.temp}
        </h3>
        <p style={{ fontSize: '13px', color: '#1E40AF', margin: 0 }}>{scenario.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', maxHeight: '35vh', overflowY: 'auto' }}>
        {CLOTHING_ITEMS.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`game-item ${isSelected ? 'selected' : ''}`}
            >
              <div className="game-item-emoji">{item.emoji}</div>
              <div>{item.name}</div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '12px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '☀️' : '🌧️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={handleCheck} className="game-btn game-btn-primary">
          Check Outfit 👗
        </button>
      </div>
    </div>
  );
}

// ── 9. DAILY ROUTINE GAME ─────────────────────────────────────
function RoutineGame({ onFinish }) {
  // Shuffle steps initially
  const [steps, setSteps] = useState(() => {
    return [...ROUTINE_STEPS].sort(() => Math.random() - 0.5);
  });
  const [feedback, setFeedback] = useState(null);

  const moveStep = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= steps.length) return;
    const next = [...steps];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    setSteps(next);
  };

  const handleCheck = () => {
    const isSorted = steps.every((s, i) => s.order === i + 1);
    if (isSorted) {
      setFeedback({
        type: 'correct',
        title: 'Perfect Morning Routine!',
        message: 'You sequenced the morning routine in ideal chronological order! Ready for school on time.',
      });
      setTimeout(() => onFinish(), 1500);
    } else {
      setFeedback({
        type: 'wrong',
        title: 'Not quite in order!',
        message: 'Think: What do you do right after waking up? Put teeth brushing before breakfast or after?',
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
        Use the <strong>▲</strong> and <strong>▼</strong> arrows to put your morning routine in chronological order from first to last!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '48vh', overflowY: 'auto' }}>
        {steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              background: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#94A3B8', width: '20px' }}>
                #{idx + 1}
              </span>
              <span style={{ fontSize: '24px' }}>{step.emoji}</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{step.name}</span>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => moveStep(idx, idx - 1)}
                disabled={idx === 0}
                style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: idx === 0 ? '#F1F5F9' : '#FFFFFF',
                  cursor: idx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveStep(idx, idx + 1)}
                disabled={idx === steps.length - 1}
                style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: idx === steps.length - 1 ? '#F1F5F9' : '#FFFFFF',
                  cursor: idx === steps.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '12px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '⏰' : '❌'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={handleCheck} className="game-btn game-btn-primary">
          Verify Routine ⏰
        </button>
      </div>
    </div>
  );
}

// ── 10. LAUNDRY SORTING GAME ──────────────────────────────────
function LaundryGame({ onFinish }) {
  const [items, setItems] = useState(() => LAUNDRY_ITEMS.slice(0, 6));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentItem = items[index];

  const handleSort = (basketType) => {
    if (!currentItem) return;
    const isCorrect = currentItem.color === basketType;

    if (isCorrect) {
      setFeedback({ type: 'correct', title: 'Correct Basket!', message: `${currentItem.name} sorted into the ${basketType} load.` });
      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= items.length) {
          onFinish();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1000);
    } else {
      setFeedback({
        type: 'wrong',
        title: 'Color Bleed Danger!',
        message: 'Mixing dark colours with whites can dye your light clothes! Sort lights and darks separately.',
      });
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(index / items.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{index} of {items.length} Sorted</span>
      </div>

      {currentItem && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '56px', lineHeight: 1 }}>{currentItem.emoji}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '6px' }}>
            {currentItem.name}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Sort into Whites & Lights vs Darks & Colours</p>
        </div>
      )}

      <div className="game-bins">
        <div
          className="game-bin"
          onClick={() => handleSort('light')}
          style={{ borderColor: '#94A3B8', background: '#F8FAFC' }}
        >
          <div className="game-bin-emoji">⚪</div>
          <div className="game-bin-name" style={{ color: '#334155' }}>Whites & Lights</div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>White shirts, towels, light socks</div>
        </div>

        <div
          className="game-bin"
          onClick={() => handleSort('dark')}
          style={{ borderColor: '#3B82F6', background: '#EFF6FF' }}
        >
          <div className="game-bin-emoji">⚫</div>
          <div className="game-bin-name" style={{ color: '#1E3A8A' }}>Darks & Colours</div>
          <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '4px' }}>Jeens, red dress, black tees</div>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '🧺' : '⚠️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 11. PLANT CARE & COMPOST GAME ─────────────────────────────
function PlantGame({ onFinish }) {
  const [compostItems] = useState(() => COMPOST_ITEMS.slice(0, 5));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const currentItem = compostItems[index];

  const handleCompostChoice = (isCompostable) => {
    if (!currentItem) return;
    const isCorrect = currentItem.compostable === isCompostable;

    if (isCorrect) {
      setFeedback({ type: 'correct', title: 'Green Thumb!', message: currentItem.reason });
      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= compostItems.length) {
          onFinish();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1400);
    } else {
      setFeedback({ type: 'wrong', title: 'Soil Alert!', message: currentItem.reason });
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(index / compostItems.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">{index} of {compostItems.length} Classified</span>
      </div>

      {currentItem && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '56px', lineHeight: 1 }}>{currentItem.emoji}</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#1E293B', marginTop: '6px' }}>
            {currentItem.name}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Can this item be composted to feed garden soil?</p>
        </div>
      )}

      <div className="game-bins">
        <div
          className="game-bin"
          onClick={() => handleCompostChoice(true)}
          style={{ borderColor: '#22C55E', background: '#F0FDF4' }}
        >
          <div className="game-bin-emoji">🌱</div>
          <div className="game-bin-name" style={{ color: '#15803D' }}>Yes, Compostable!</div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>Breaks down into rich soil nutrient</div>
        </div>

        <div
          className="game-bin"
          onClick={() => handleCompostChoice(false)}
          style={{ borderColor: '#EF4444', background: '#FEF2F2' }}
        >
          <div className="game-bin-emoji">🚫</div>
          <div className="game-bin-name" style={{ color: '#B91C1C' }}>Do Not Compost</div>
          <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '4px' }}>Plastic, metals, harmful items</div>
        </div>
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '🪴' : '⚠️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 12. SAFETY DETECTIVE GAME ─────────────────────────────────
function SafetyGame({ onFinish }) {
  const [scenarios] = useState(() => SAFETY_SCENARIOS.slice(0, 4));
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const scenario = scenarios[index];

  const handlePick = (optIdx) => {
    if (optIdx === scenario.correct) {
      setFeedback({ type: 'correct', title: 'Smart & Safe Choice!', message: scenario.explanation });
      setTimeout(() => {
        setFeedback(null);
        if (index + 1 >= scenarios.length) {
          onFinish();
        } else {
          setIndex((i) => i + 1);
        }
      }, 1800);
    } else {
      setFeedback({
        type: 'wrong',
        title: 'Safety Warning!',
        message: 'That could be dangerous! What is the safest choice for a child at home?',
      });
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <div>
      <div className="game-progress">
        <div className="game-progress-bar">
          <div className="game-progress-fill" style={{ width: `${(index / scenarios.length) * 100}%` }} />
        </div>
        <span className="game-progress-text">Hazard #{index + 1} of {scenarios.length}</span>
      </div>

      <div style={{ margin: '16px 0', padding: '16px', background: '#FFF7ED', borderRadius: '18px', border: '2px solid #FED7AA' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🛡️</div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#9A3412', margin: 0 }}>
          {scenario.question}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {scenario.options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)} className="option-btn">
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`feedback-panel ${feedback.type}`} style={{ marginTop: '14px' }}>
          <div className="feedback-icon">{feedback.type === 'correct' ? '🛡️' : '⚠️'}</div>
          <div className="feedback-text">
            <h3>{feedback.title}</h3>
            <p>{feedback.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
