import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import PlayerAvatar from '@/features/player/components/PlayerAvatar';
import { Droplet, Sun, Snowflake, Leaf, Sprout, Axe, Store, X, ArrowLeft, Play, Pause, SkipForward, Music, Volume2, VolumeX, Info, LogOut, CloudRain, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
const DAYS_PER_SEASON = 4;

const EMOJIS = {
  // Tools & States
  seed: String.fromCodePoint(0x1F331),
  growing: String.fromCodePoint(0x1F33F),
  dead: String.fromCodePoint(0x1F940),
  coin: String.fromCodePoint(0x1FA99),
  
  // Crops
  wheat: String.fromCodePoint(0x1F33E),
  millet: String.fromCodePoint(0x1F33F),
  mustard: String.fromCodePoint(0x1F33C),
  bajra: String.fromCodePoint(0x1F33E),
  
  // Fruits
  banana: String.fromCodePoint(0x1F34C),
  carrot: String.fromCodePoint(0x1F955),
  mango: String.fromCodePoint(0x1F96D),
  watermelon: String.fromCodePoint(0x1F349),
  grapes: String.fromCodePoint(0x1F347),
  
  // Vegetables
  ladyfinger: String.fromCodePoint(0x1F952),
  tomato: String.fromCodePoint(0x1F345),
  lemon: String.fromCodePoint(0x1F34B),
  cucumber: String.fromCodePoint(0x1F952)
};

const CROPS = {
  // --- CROPS ---
  wheat: {
    id: 'wheat', name: 'Wheat', type: 'crop', seasons: ['Spring', 'Summer'], daysToGrow: 2, buyPrice: 5, sellPrice: 15, xp: 10,
    sowMonth: 'October-November (Winter)', sowWay: 'Line sowing (drill)', nutrition: 'Carbs, Protein (Gluten), Vit B',
    description: 'A major cereal grain. Crucial for global food security.', soil: 'Well-drained loam or clay loam', waterNeeds: 'Moderate'
  },
  millet: {
    id: 'millet', name: 'Millet', type: 'crop', seasons: ['Summer'], daysToGrow: 2, buyPrice: 4, sellPrice: 12, xp: 8,
    sowMonth: 'June-July (Monsoon)', sowWay: 'Broadcasting or drilling', nutrition: 'High Fiber, Magnesium, Calcium',
    description: 'Drought-resistant grain, excellent for dryland farming.', soil: 'Sandy loam to clay loam', waterNeeds: 'Low (Drought tolerant)'
  },
  mustard: {
    id: 'mustard', name: 'Mustard', type: 'crop', seasons: ['Autumn', 'Winter'], daysToGrow: 2, buyPrice: 6, sellPrice: 18, xp: 12,
    sowMonth: 'October (Autumn)', sowWay: 'Line sowing in shallow depths', nutrition: 'Omega-3, Vitamin E, Calcium',
    description: 'Important oilseed crop with bright yellow flowers.', soil: 'Light to heavy loamy soils', waterNeeds: 'Low to Moderate'
  },
  bajra: {
    id: 'bajra', name: 'Bajra', type: 'crop', seasons: ['Summer'], daysToGrow: 2, buyPrice: 4, sellPrice: 14, xp: 10,
    sowMonth: 'July (Summer)', sowWay: 'Shallow sowing in rows', nutrition: 'High Protein, Iron, Zinc',
    description: 'Pearl millet, highly adapted to extreme heat and poor soils.', soil: 'Light sandy soils', waterNeeds: 'Very Low'
  },

  // --- FRUITS ---
  banana: {
    id: 'banana', name: 'Banana', type: 'fruit', seasons: ['Spring', 'Summer', 'Autumn'], daysToGrow: 3, buyPrice: 15, sellPrice: 45, xp: 20,
    sowMonth: 'February-March', sowWay: 'Planting suckers or tissue culture', nutrition: 'Potassium, Vitamin B6, Vitamin C',
    description: 'A fast-growing herbaceous plant, highly nutrient-demanding.', soil: 'Deep, rich, well-drained loam', waterNeeds: 'High'
  },
  carrot: {
    id: 'carrot', name: 'Carrot', type: 'fruit', seasons: ['Autumn', 'Winter'], daysToGrow: 2, buyPrice: 10, sellPrice: 25, xp: 15,
    sowMonth: 'August-October', sowWay: 'Direct sowing on ridges/beds', nutrition: 'Beta-carotene (Vit A), Vitamin K1',
    description: 'A root vegetable requiring loose soil to grow straight.', soil: 'Deep, loose, sandy loam', waterNeeds: 'Moderate'
  },
  mango: {
    id: 'mango', name: 'Mango', type: 'fruit', seasons: ['Summer'], daysToGrow: 4, buyPrice: 30, sellPrice: 100, xp: 40,
    sowMonth: 'July-August', sowWay: 'Grafting, planted in large pits', nutrition: 'Vitamin C, Vitamin A, Folate',
    description: 'The king of fruits, requires tropical/subtropical climates.', soil: 'Lateritic, alluvial, well-drained', waterNeeds: 'Moderate'
  },
  watermelon: {
    id: 'watermelon', name: 'Watermelon', type: 'fruit', seasons: ['Summer'], daysToGrow: 3, buyPrice: 12, sellPrice: 40, xp: 18,
    sowMonth: 'February-March', sowWay: 'Hill planting (2-3 seeds per mound)', nutrition: 'Vitamin C, Vitamin A, Hydration',
    description: 'A sprawling vine plant that thrives in intense summer heat.', soil: 'Sandy loam (rich in organic matter)', waterNeeds: 'High'
  },
  grapes: {
    id: 'grapes', name: 'Grapes', type: 'fruit', seasons: ['Summer', 'Autumn'], daysToGrow: 3, buyPrice: 20, sellPrice: 70, xp: 25,
    sowMonth: 'October-January', sowWay: 'Hardwood stem cuttings', nutrition: 'Antioxidants, Vit C, Vit K',
    description: 'A woody vine crop requiring trellising and regular pruning.', soil: 'Well-drained gravelly loam', waterNeeds: 'Moderate'
  },

  // --- VEGETABLES ---
  ladyfinger: {
    id: 'ladyfinger', name: 'Ladyfinger', type: 'vegetable', seasons: ['Spring', 'Summer'], daysToGrow: 2, buyPrice: 8, sellPrice: 24, xp: 12,
    sowMonth: 'February-March', sowWay: 'Dibbling seeds on raised beds', nutrition: 'Dietary Fiber, Vitamin C, Vitamin K',
    description: 'Also known as Okra. Thrives in warm, humid climates.', soil: 'Sandy to clay loam', waterNeeds: 'Moderate'
  },
  tomato: {
    id: 'tomato', name: 'Tomato', type: 'vegetable', seasons: ['Summer', 'Autumn'], daysToGrow: 2, buyPrice: 7, sellPrice: 22, xp: 10,
    sowMonth: 'May-June', sowWay: 'Nursery raising & transplanting', nutrition: 'Lycopene, Vitamin C, Potassium',
    description: 'A staple nightshade crop requiring staking and pruning.', soil: 'Well-drained sandy loam', waterNeeds: 'Moderate'
  },
  lemon: {
    id: 'lemon', name: 'Lemon', type: 'vegetable', seasons: ['Summer', 'Autumn'], daysToGrow: 3, buyPrice: 15, sellPrice: 50, xp: 22,
    sowMonth: 'July-August', sowWay: 'Seeds or vegetative budding', nutrition: 'High Vitamin C, Citric Acid',
    description: 'A small evergreen citrus tree. Highly sensitive to frost.', soil: 'Medium to light loamy soils', waterNeeds: 'Moderate'
  },
  cucumber: {
    id: 'cucumber', name: 'Cucumber', type: 'vegetable', seasons: ['Summer'], daysToGrow: 2, buyPrice: 6, sellPrice: 18, xp: 9,
    sowMonth: 'February-March', sowWay: 'Direct sowing on mounds/ridges', nutrition: 'Vitamin K, Potassium, 95% Water',
    description: 'A creeping vine plant. Highly responsive to organic manure.', soil: 'Rich sandy loam', waterNeeds: 'High'
  }
};

const getSeasonIcon = (season) => {
  switch (season) {
    case 'Spring': return <Sprout size={20} color="#22c55e" />;
    case 'Summer': return <Sun size={20} color="#eab308" />;
    case 'Autumn': return <Leaf size={20} color="#f97316" />;
    case 'Winter': return <Snowflake size={20} color="#60a5fa" />;
    default: return null;
  }
};


const INITIAL_PLOTS = [
  // --- GRID 1 (Left side) ---
  { id: 0, x: 250, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 1, x: 380, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 2, x: 510, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  
  { id: 3, x: 250, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 4, x: 380, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 5, x: 510, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  
  { id: 6, x: 250, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 7, x: 380, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 8, x: 510, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },

  // --- GRID 2 (Right side) ---
  { id: 9, x: 880, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 10, x: 1010, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 11, x: 1140, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  
  { id: 12, x: 880, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 13, x: 1010, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 14, x: 1140, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  
  { id: 15, x: 880, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 16, x: 1010, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 17, x: 1140, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },

  // --- GRID 3 (Bottom Left) ---
  { id: 18, x: 250, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 19, x: 380, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 20, x: 510, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 21, x: 250, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 22, x: 380, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 23, x: 510, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 24, x: 250, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 25, x: 380, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 26, x: 510, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },

  // --- GRID 4 (Bottom Right) ---
  { id: 27, x: 880, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 28, x: 1010, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 29, x: 1140, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 30, x: 880, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 31, x: 1010, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 32, x: 1140, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 33, x: 880, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 34, x: 1010, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
  { id: 35, x: 1140, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false },
];

const MUSIC_TRACKS = [
  { name: "Lofi Farm Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Sunny Harvest", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Chill Village", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function FarmGame2D() {
  const { player, earnXP, addCoins, spendCoins, updatePlayer, updateSkill, markWorldCompleted } = usePlayer();
  
  const [day, setDay] = useState(1);
  const [inventory, setInventory] = useState({ 
    wheat: 5, millet: 0, mustard: 0, bajra: 0,
    banana: 0, carrot: 0, mango: 0, watermelon: 0, grapes: 0,
    ladyfinger: 0, tomato: 0, lemon: 0, cucumber: 0
  });
  const [harvested, setHarvested] = useState({ 
    wheat: 0, millet: 0, mustard: 0, bajra: 0,
    banana: 0, carrot: 0, mango: 0, watermelon: 0, grapes: 0,
    ladyfinger: 0, tomato: 0, lemon: 0, cucumber: 0
  });
  const [plots, setPlots] = useState(INITIAL_PLOTS);

  const [activeTool, setActiveTool] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [hoveredInfoId, setHoveredInfoId] = useState(null);
  const [hoveredLeave, setHoveredLeave] = useState(false);
  
  // Weather State
  const [weather, setWeather] = useState('sunny');
  
  // Toast Notifications
  const [notifications, setNotifications] = useState([]);
  
  const addNotification = (message) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 2500);
  };
  
  const [playerPos, setPlayerPos] = useState({ x: 100, y: 350 });
  const [facing, setFacing] = useState(1);
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const mapRef = useRef(null);

  // Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const currentSeason = SEASONS[Math.floor((day - 1) / DAYS_PER_SEASON) % 4];

  useEffect(() => {
    const handleKeyDown = (e) => { 
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) keys.current[key] = true; 
    };
    const handleKeyUp = (e) => { 
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) keys.current[key] = false; 
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    let animationFrameId;
    const speed = 5;
    
    const loop = () => {
      setPlayerPos(p => {
        let nx = p.x; let ny = p.y;
        if (keys.current.w) ny -= speed;
        if (keys.current.s) ny += speed;
        if (keys.current.a) { nx -= speed; setFacing(-1); }
        if (keys.current.d) { nx += speed; setFacing(1); }
        
        if (mapRef.current) {
          const mapHeight = 1400; // Expanded map height
          if (nx < 20) nx = 20;
          if (nx > 1516) nx = 1516; // 1536 - 20
          if (ny < 100) ny = 100;
          if (ny > mapHeight - 20) ny = mapHeight - 20;
          
          // Auto-scroll vertically if player nears edges of viewport
          const buffer = 150;
          if (ny > window.scrollY + window.innerHeight - buffer) {
             window.scrollBy(0, speed);
          } else if (ny < window.scrollY + buffer) {
             window.scrollBy(0, -speed);
          }
        }
        
        if (nx !== p.x || ny !== p.y) return { x: nx, y: ny };
        return p;
      });
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    }
  }, []);

  const handlePlotInteraction = (plot) => {
    const dist = Math.hypot(plot.x - playerPos.x, plot.y - playerPos.y);
    if (dist > 120) return;
    if (!activeTool) return;

    setPlots(currentPlots => currentPlots.map(p => {
      if (p.id !== plot.id) return p;

      if (CROPS[activeTool]) {
        if ((p.state === 'empty' || p.state === 'dead') && inventory[activeTool] > 0) {
          setInventory(prev => ({ ...prev, [activeTool]: prev[activeTool] - 1 }));
          if (inventory[activeTool] - 1 === 0) setActiveTool(null);
          // If it's raining, the seed is automatically watered instantly!
          return { ...p, state: 'seed', cropId: activeTool, daysPlanted: 0, isWatered: weather === 'rainy' };
        }
      }
      
      if (activeTool === 'water' && p.state !== 'empty' && p.state !== 'dead' && p.state !== 'ready' && !p.isWatered) {
        if (player.water >= 10) {
          updatePlayer({ water: player.water - 10 });
          updateSkill("vocational", 2);
          return { ...p, isWatered: true };
        } else {
          addNotification("Not enough water! You need 10L per plot. Waste less water at home!");
          return p;
        }
      }

      if (activeTool === 'harvest') {
        if (p.state === 'ready') {
          const cropData = CROPS[p.cropId];
          earnXP(cropData.xp);
          // Store crop instead of instant cash
          setHarvested(prev => ({ ...prev, [p.cropId]: prev[p.cropId] + 1 }));
          addNotification(`${EMOJIS[p.cropId]} Harvested ${cropData.name}!`);
          return { ...p, state: 'empty', cropId: null, daysPlanted: 0, isWatered: weather === 'rainy' };
        } else if (p.state === 'dead') {
          return { ...p, state: 'empty', cropId: null, daysPlanted: 0, isWatered: weather === 'rainy' };
        }
      }
      return p;
    }));
  };

  const sellAllCrop = (cropId) => {
    const qty = harvested[cropId];
    if (qty > 0) {
      setHarvested(prev => ({ ...prev, [cropId]: 0 }));
      const profit = CROPS[cropId].sellPrice * qty;
      addCoins(profit);
      addNotification(`Sold ${qty}x ${CROPS[cropId].name} for ${profit} coins!`);
    }
  };

  const advanceDay = () => {
    const nextDay = day + 1;
    const nextSeason = SEASONS[Math.floor((nextDay - 1) / DAYS_PER_SEASON) % 4];
    
    // Calculate tomorrow's weather
    const isRaining = Math.random() < 0.35; // 35% chance of rain
    const nextWeather = isRaining ? 'rainy' : 'sunny';

    setPlots(currentPlots => currentPlots.map(p => {
      if (p.state === 'empty' || p.state === 'dead' || p.state === 'ready') {
         return { ...p, isWatered: isRaining };
      }

      const cropData = CROPS[p.cropId];
      if (!cropData.seasons.includes(nextSeason)) {
        return { ...p, state: 'dead', isWatered: false };
      }

      if (p.isWatered) {
        const newDaysPlanted = p.daysPlanted + 1;
        let newState = p.state;
        if (newDaysPlanted >= cropData.daysToGrow) {
          newState = 'ready';
        } else {
          newState = 'growing';
        }
        return { ...p, state: newState, daysPlanted: newDaysPlanted, isWatered: isRaining };
      }
      
      // If it wasn't watered yesterday, it doesn't grow today, but might be watered by rain for tomorrow
      return { ...p, isWatered: isRaining };
    }));

    setDay(nextDay);
    setWeather(nextWeather);
    
    if (isRaining) {
      addNotification("It's raining! All crops have been watered.");
    }
  };

  const buyItem = (crop) => {
    if (spendCoins(crop.buyPrice)) {
      setInventory(prev => ({ ...prev, [crop.id]: prev[crop.id] + 1 }));
      // Gain XP for buying seeds (half the cost)
      const xpGained = Math.max(2, Math.floor(crop.buyPrice / 2));
      earnXP(xpGained);
      addNotification(`Bought 1x ${crop.name} seed!`);
    }
  };

  const renderCrop = (plot) => {
    if (plot.state === 'empty') return null;
    let emoji = '';
    if (plot.state === 'dead') emoji = EMOJIS.dead;
    else if (plot.state === 'seed') emoji = EMOJIS.seed;
    else if (plot.state === 'growing') emoji = EMOJIS.growing;
    else if (plot.state === 'ready') emoji = EMOJIS[plot.cropId];

    return <span style={{ fontSize: '3rem', userSelect: 'none' }}>{emoji}</span>;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % MUSIC_TRACKS.length);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log("Audio prevented:", e));
    }
  }, [trackIndex]);

  // Inventory 8-slot calculation
  const ownedCropIds = Object.keys(inventory).filter(id => inventory[id] > 0);
  const displayedCropIds = ownedCropIds.slice(0, 6);
  const emptySlotsCount = Math.max(0, 6 - displayedCropIds.length);

  // Helper to render shop categories
  const renderShopCategory = (title, type) => {
    const items = Object.values(CROPS).filter(c => c.type === type);
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '20px', borderBottom: '3px solid #f1f5f9', paddingBottom: '8px' }}>
          {title}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {items.map(crop => (
            <div key={`shop-${crop.id}`} style={{ backgroundColor: 'white', border: '3px solid #e2e8f0', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              <div style={{ fontSize: '3rem', backgroundColor: '#f8fafc', minWidth: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '2px solid #f1f5f9' }}>
                {EMOJIS[crop.id]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  {crop.name}
                  
                  {/* Info Hover Button */}
                  <div 
                    onMouseEnter={() => {
                      if (window.hoverTimeout) clearTimeout(window.hoverTimeout);
                      setHoveredInfoId(crop.id);
                    }}
                    onMouseLeave={() => {
                      window.hoverTimeout = setTimeout(() => setHoveredInfoId(null), 300);
                    }}
                    style={{ cursor: 'help', display: 'inline-flex' }}
                  >
                    <Info size={20} color="#64748b" />
                  </div>
                </h3>
                <p style={{ color: '#64748b', fontWeight: 500, margin: '0 0 12px 0', fontSize: '0.875rem' }}>Grows in {crop.seasons.join(', ')}</p>
                
                <button
                  onClick={() => buyItem(crop)}
                  disabled={player.coins < crop.buyPrice}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: player.coins >= crop.buyPrice ? 'pointer' : 'not-allowed', border: 'none',
                    ...(player.coins >= crop.buyPrice 
                      ? { backgroundColor: '#fef3c7', color: '#b45309', borderBottom: '4px solid #fcd34d' } 
                      : { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '2px solid #e2e8f0' })
                  }}
                >
                  Buy for {EMOJIS.coin} {crop.buyPrice}
                </button>
              </div>

              {/* Tooltip anchored to the CARD */}
              <AnimatePresence>
                {hoveredInfoId === crop.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onMouseEnter={() => {
                      if (window.hoverTimeout) clearTimeout(window.hoverTimeout);
                      setHoveredInfoId(crop.id);
                    }}
                    onMouseLeave={() => {
                      window.hoverTimeout = setTimeout(() => setHoveredInfoId(null), 300);
                    }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: '0', right: '0',
                      backgroundColor: '#ffffff', color: '#334155', padding: '20px', borderRadius: '12px',
                      zIndex: 100, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                      pointerEvents: 'auto', border: '1px solid #cbd5e1', textAlign: 'left',
                      fontSize: '0.75rem', lineHeight: '1.5'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      {crop.name} Details
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#64748b', margin: '0 0 12px 0' }}>{crop.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Sow Month:</span><span style={{ color: '#0f172a' }}>{crop.sowMonth}</span>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Technique:</span><span style={{ color: '#0f172a' }}>{crop.sowWay}</span>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Soil Type:</span><span style={{ color: '#0f172a' }}>{crop.soil}</span>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Watering:</span><span style={{ color: '#0f172a' }}>{crop.waterNeeds}</span>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Nutritional Profile</strong>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{crop.nutrition}</span>
                    </div>
                    
                    {/* Arrow pointing up */}
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #ffffff' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '1400px', backgroundColor: '#059669', fontFamily: 'sans-serif' }} ref={mapRef}>
      
      {/* Rain Animation Styles */}
      <style>
        {`
          @keyframes rainFall {
            0% { background-position: 0px 0px; }
            100% { background-position: 100px 1000px; }
          }
        `}
      </style>

      {/* Background */}
      <div style={{ 
        position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(#047857 2px, transparent 2px)', 
        backgroundSize: '40px 40px' 
      }} />

      {/* Rain Overlay */}
      {weather === 'rainy' && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 15,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\'%3E%3Cline x1=\'50\' y1=\'0\' x2=\'50\' y2=\'20\' stroke=\'%2393c5fd\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-opacity=\'0.6\' /%3E%3C/svg%3E")',
          animation: 'rainFall 0.8s linear infinite'
        }} />
      )}

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'none', alignItems: 'center' }}>
        <AnimatePresence>
          {notifications.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              style={{ backgroundColor: 'rgba(15,23,42,0.95)', color: 'white', padding: '12px 24px', borderRadius: '32px', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid #334155' }}
            >
              {note.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <audio ref={audioRef} src={MUSIC_TRACKS[trackIndex].url} onEnded={nextTrack} loop={false} />

      {/* Top HUD */}
      <div style={{ position: 'fixed', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 40, pointerEvents: 'none' }}>
        
        {/* Left Side: Navigation & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'auto', width: '320px', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
          
          {/* 2. PLAYER STATUS CARD */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: 'rgba(250,249,246,0.95)', backdropFilter: 'blur(8px)',
            borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '12px 0'
          }}>
            {/* Season & Weather */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.9)' }}>
                {getSeasonIcon(currentSeason)}
              </div>
              <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>{currentSeason}</span>
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                {weather === 'rainy' ? (
                  <CloudRain size={18} color="#3b82f6" title="Rainy" />
                ) : (
                  <Sun size={18} color="#f59e0b" title="Sunny" />
                )}
              </div>
            </div>
            
            {/* Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
            
            {/* Day & Next Button */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day</span>
                <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>{day}</span>
              </div>
              <button 
                onClick={advanceDay}
                title="Advance to Next Day"
                style={{ 
                  backgroundColor: '#3b82f6', color: 'white', border: 'none', borderBottom: '2px solid #1d4ed8', 
                  padding: '4px 6px', borderRadius: '6px', fontWeight: 800, fontSize: '0.6rem', 
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                  transform: 'translateY(-1px)'
                }}
              >
                Next ➔
              </button>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
            
            {/* Coins */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{EMOJIS.coin}</span>
              <span style={{ fontWeight: 800, color: '#b45309', fontSize: '1.1rem' }}>{player.coins}</span>
            </div>
            
            {/* Water */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.08)' }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#2563eb' }}>
              <Droplet size={18} />
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{player.water}L</span>
            </div>
          </div>
        </div>

        {/* Right Side: Player Level & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', pointerEvents: 'auto', width: '320px', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
          
          {/* 3. PLAYER LEVEL / XP CARD */}
          <div style={{ 
            backgroundColor: 'rgba(250,249,246,0.95)', backdropFilter: 'blur(8px)',
            borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
            border: '1px solid rgba(0,0,0,0.08)', width: '100%',
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#064e3b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Level {player.level} Farmer
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#64748b' }}>
                  {player.name} Lv.{player.level}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
                  {player.xp % 100} / 100 XP
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
              <motion.div 
                initial={false} 
                animate={{ width: `${(player.xp % 100)}%` }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                style={{ height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* The World / Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        
        {/* --- CROP PLOT FENCE 1 (Left Grid) --- */}
        <div style={{
          position: 'absolute', left: '170px', top: '170px', width: '420px', height: '420px',
          border: '12px dashed #92400e', borderRadius: '16px', pointerEvents: 'none', opacity: 0.8
        }} />

        {/* --- CROP PLOT FENCE 2 (Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '800px', top: '170px', width: '420px', height: '420px',
          border: '12px dashed #92400e', borderRadius: '16px', pointerEvents: 'none', opacity: 0.8
        }} />

        {/* --- CROP PLOT FENCE 3 (Bottom Left Grid) --- */}
        <div style={{
          position: 'absolute', left: '170px', top: '670px', width: '420px', height: '420px',
          border: '12px dashed #92400e', borderRadius: '16px', pointerEvents: 'none', opacity: 0.8
        }} />

        {/* --- CROP PLOT FENCE 4 (Bottom Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '800px', top: '670px', width: '420px', height: '420px',
          border: '12px dashed #92400e', borderRadius: '16px', pointerEvents: 'none', opacity: 0.8
        }} />

        {/* Farm Plots */}
        {plots.map((plot) => {
          const dist = Math.hypot(plot.x - playerPos.x, plot.y - playerPos.y);
          const isNear = dist < 120;
          const bg = plot.isWatered ? '#5c4033' : '#8b5e3c';
          const border = plot.isWatered ? '#3e2b22' : '#6b472b';
          
          return (
            <div
              key={plot.id}
              onClick={() => handlePlotInteraction(plot)}
              style={{
                position: 'absolute', width: '110px', height: '110px',
                transform: 'translate(-50%, -50%)', borderRadius: '16px',
                border: `4px solid ${border}`, backgroundColor: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                left: plot.x, top: plot.y,
                cursor: isNear ? 'pointer' : 'not-allowed',
                opacity: isNear ? 1 : 0.8,
                boxShadow: isNear ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <motion.div
                key={`${plot.state}-${plot.isWatered}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ zIndex: 10, position: 'relative' }}
              >
                {renderCrop(plot)}
              </motion.div>

              {plot.isWatered && (
                <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                  <Droplet size={20} color="#60a5fa" fill="#60a5fa" />
                </div>
              )}
              
              {plot.state === 'ready' && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(250,204,21,0.2)', borderRadius: '12px', pointerEvents: 'none' }} />
              )}
              
              {isNear && activeTool && (
                <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255,255,255,0.4)', borderRadius: '12px', pointerEvents: 'none' }} />
              )}
            </div>
          );
        })}

        {/* Player Sprite */}
        <div 
          style={{ 
            position: 'absolute', zIndex: 20, pointerEvents: 'none',
            left: playerPos.x, top: playerPos.y, 
            transform: `translate(-50%, -100%) scaleX(${facing})`,
            transition: 'transform 0.05s linear'
          }}
        >
          <svg viewBox="-50 -150 100 200" width="100" height="200" style={{ overflow: 'visible' }}>
            <PlayerAvatar name={player.name} level={player.level} x={0} y={0} />
            
            {/* Equipped Tool Overlay */}
            {activeTool === 'water' && (
              <g transform="translate(15, -42)">
                <rect x="0" y="0" width="14" height="16" rx="3" fill="#3b82f6" />
                <path d="M 14 8 L 22 2 L 23 5 Z" fill="#93c5fd" />
                <path d="M -3 3 Q -8 8 -3 13" fill="none" stroke="#1d4ed8" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}
            
            {activeTool === 'harvest' && (
              <g transform="translate(17, -50)">
                <rect x="0" y="-15" width="4" height="40" rx="2" fill="#78350f" />
                <path d="M -2 -12 L 12 -12 L 14 -5 L 4 -5 Z" fill="#94a3b8" />
              </g>
            )}

            {activeTool && activeTool !== 'water' && activeTool !== 'harvest' && (
              <g transform="translate(14, -38)">
                <path d="M 0 12 Q 6 22 12 12 L 10 0 L 2 0 Z" fill="#b45309" />
                <rect x="2" y="-3" width="8" height="4" fill="#fcd34d" rx="1" />
                <text x="6" y="9" fontSize="8" textAnchor="middle" fill="#fff" fontWeight="bold">S</text>
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Harvest Storage Panel */}
      <div style={{ 
        position: 'fixed', right: '16px', top: '150px', bottom: '180px', width: '220px', 
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', 
        borderRadius: '24px', padding: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        border: '4px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 40 
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', marginBottom: '16px', borderBottom: '3px solid #f1f5f9', paddingBottom: '8px', textAlign: 'center' }}>
          📦 Silo Storage
        </h3>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.keys(harvested).map(cropId => {
            if (harvested[cropId] === 0) return null;
            const crop = CROPS[cropId];
            return (
              <div key={`harvested-${cropId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{EMOJIS[cropId]}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.875rem' }}>{crop.name}</span>
                    <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.7rem' }}>x{harvested[cropId]}</span>
                  </div>
                </div>
                <button 
                  onClick={() => sellAllCrop(cropId)}
                  style={{ backgroundColor: '#fef3c7', border: '2px solid #fcd34d', color: '#b45309', fontWeight: 800, fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Sell
                </button>
              </div>
            );
          })}
          
          {Object.values(harvested).every(v => v === 0) && (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600, fontSize: '0.875rem', marginTop: '24px' }}>
              Your silo is empty!<br/>Harvest crops to store them.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Toolbar & Shop Wrapper (60% width, centered) */}
      <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '12px', width: '60%', minWidth: '600px', maxWidth: '800px' }}>
        
        {/* Tools Panel (Exactly 8 Slots) */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '8px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)', border: '3px solid #e2e8f0', display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
          
          <ToolButton 
            active={activeTool === 'water'} 
            onClick={() => setActiveTool('water')}
            icon={<Droplet size={24} color="#3b82f6" fill="#bfdbfe" />}
            label="Water"
          />
          <ToolButton 
            active={activeTool === 'harvest'} 
            onClick={() => setActiveTool('harvest')}
            icon={<Axe size={24} color="#475569" />}
            label="Harvest"
          />
          
          <div style={{ minWidth: '4px', borderRadius: '2px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

          {/* Owned Crops */}
          {displayedCropIds.map(cropId => {
            const crop = CROPS[cropId];
            return (
              <ToolButton
                key={`inv-${crop.id}`}
                active={activeTool === crop.id}
                onClick={() => setActiveTool(crop.id)}
                icon={<span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{EMOJIS[crop.id]}</span>}
                label={crop.name}
                badge={inventory[crop.id]}
              />
            );
          })}

          {/* Empty Slots to pad up to 8 total blocks (2 tools + up to 6 crops) */}
          {Array.from({ length: emptySlotsCount }).map((_, i) => (
            <ToolButton
              key={`empty-${i}`}
              active={false}
              onClick={() => {}}
              icon={<div style={{ width: '20px', height: '20px', border: '3px dashed #cbd5e1', borderRadius: '50%' }} />}
              label="Empty"
            />
          ))}
        </div>

        {/* Shop Button */}
        <button
          onClick={() => setIsShopOpen(true)}
          style={{ display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', border: '3px solid #fcd34d', backgroundColor: '#fef3c7', color: '#b45309', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)' }}
        >
          <Store size={24} style={{ marginBottom: '2px' }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.05em' }}>SHOP</span>
        </button>
      </div>

      {/* Keyboard Controls Hint */}
      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 40, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: '16px', padding: '16px', color: 'white', fontWeight: 500, fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['W','A','S','D'].map(k => <kbd key={k} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{k}</kbd>)}
          </div>
          <span>to Move</span>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.8)' }}>
           Walk close to a plot to interact!
        </div>
      </div>

      {/* Leave Farm Button (Bottom Right) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50, pointerEvents: 'auto', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
        <Link to="/world" 
          onClick={() => markWorldCompleted('farm')}
          onMouseEnter={() => setHoveredLeave(true)}
          onMouseLeave={() => setHoveredLeave(false)}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            backgroundColor: '#ef4444', color: 'white', 
            width: '64px', height: '64px', borderRadius: '50%', 
            boxShadow: '0 10px 25px -5px rgba(239,68,68,0.5)', 
            border: '4px solid #f87171', textDecoration: 'none',
            position: 'relative', transition: 'all 0.2s', cursor: 'pointer'
          }}
        >
          <LogOut size={28} strokeWidth={3} style={{ marginLeft: '-4px' }} />
          
          <AnimatePresence>
            {hoveredLeave && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{ 
                  position: 'absolute', right: 'calc(100% + 16px)', 
                  backgroundColor: 'rgba(15,23,42,0.95)', color: 'white', 
                  padding: '10px 20px', borderRadius: '16px', 
                  fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                Leave Farm
                {/* Arrow */}
                <div style={{ position: 'absolute', top: '50%', left: '100%', transform: 'translateY(-50%)', borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid rgba(15,23,42,0.95)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsShopOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.98)', 
                width: '85%', maxWidth: '1000px', 
                height: '85%', maxHeight: '750px', 
                borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
                display: 'flex', flexDirection: 'column', border: '6px solid #fde68a', overflow: 'hidden' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '4px solid #f1f5f9', backgroundColor: 'white' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
                  <Store size={36} color="#f59e0b" />
                  Seed Shop
                </h2>
                <button onClick={() => setIsShopOpen(false)} style={{ padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                  <X size={28} color="#475569" />
                </button>
              </div>

              <div style={{ overflowY: 'auto', padding: '32px', paddingBottom: '200px' }}>
                {renderShopCategory('🌾 Crops', 'crop')}
                {renderShopCategory('🍎 Fruits', 'fruit')}
                {renderShopCategory('🥦 Vegetables', 'vegetable')}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label, badge }) {
  const bg = active ? '#eff6ff' : 'white';
  const borderColor = active ? '#3b82f6' : '#e2e8f0';
  const borderBottom = active ? '3px solid #3b82f6' : '4px solid #e2e8f0';
  const transform = active ? 'translateY(-2px)' : 'none';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '64px', height: '64px', borderRadius: '12px', backgroundColor: bg, border: 'none', borderLeft: `3px solid ${borderColor}`, borderRight: `3px solid ${borderColor}`, borderTop: `3px solid ${borderColor}`, borderBottom, transform, cursor: 'pointer', transition: 'all 0.1s'
      }}
    >
      <div style={{ marginBottom: '2px', transform: 'scale(0.9)' }}>{icon}</div>
      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '56px' }}>{label}</div>
      
      {badge !== undefined && (
        <div style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: badge > 0 ? '#f43f5e' : '#94a3b8', color: 'white', fontSize: '0.65rem', fontWeight: 900, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
          {badge}
        </div>
      )}
    </button>
  );
}
