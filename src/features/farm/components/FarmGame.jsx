import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import PlayerAvatar from '@/features/player/components/PlayerAvatar';
import { Droplet, Sun, Snowflake, Leaf, Sprout, Axe, Store, X, ArrowLeft, Play, Pause, SkipForward, Music, Volume2, VolumeX, Info, LogOut, CloudRain, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FarmGame.css';

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
    id: 'wheat', name: 'Wheat', type: 'crop', seasons: ['Spring', 'Summer'], daysToGrow: 2, buyPrice: 8, sellPrice: 22, xp: 12,
    sowMonth: 'October-November (Winter)', sowWay: 'Line sowing (drill)', nutrition: 'Carbs, Protein (Gluten), Vit B',
    description: 'A major cereal grain. Crucial for global food security.', soil: 'Well-drained loam or clay loam', waterNeeds: 'Moderate'
  },
  millet: {
    id: 'millet', name: 'Millet', type: 'crop', seasons: ['Summer'], daysToGrow: 2, buyPrice: 5, sellPrice: 14, xp: 8,
    sowMonth: 'June-July (Monsoon)', sowWay: 'Broadcasting or drilling', nutrition: 'High Fiber, Magnesium, Calcium',
    description: 'Drought-resistant grain, excellent for dryland farming.', soil: 'Sandy loam to clay loam', waterNeeds: 'Low (Drought tolerant)'
  },
  mustard: {
    id: 'mustard', name: 'Mustard', type: 'crop', seasons: ['Autumn', 'Winter'], daysToGrow: 2, buyPrice: 10, sellPrice: 26, xp: 14,
    sowMonth: 'October (Autumn)', sowWay: 'Line sowing in shallow depths', nutrition: 'Omega-3, Vitamin E, Calcium',
    description: 'Important oilseed crop with bright yellow flowers.', soil: 'Light to heavy loamy soils', waterNeeds: 'Low to Moderate'
  },
  bajra: {
    id: 'bajra', name: 'Bajra', type: 'crop', seasons: ['Summer'], daysToGrow: 2, buyPrice: 6, sellPrice: 16, xp: 10,
    sowMonth: 'July (Summer)', sowWay: 'Shallow sowing in rows', nutrition: 'High Protein, Iron, Zinc',
    description: 'Pearl millet, highly adapted to extreme heat and poor soils.', soil: 'Light sandy soils', waterNeeds: 'Very Low'
  },

  // --- FRUITS ---
  banana: {
    id: 'banana', name: 'Banana', type: 'fruit', seasons: ['Spring', 'Summer', 'Autumn'], daysToGrow: 3, buyPrice: 25, sellPrice: 80, xp: 30,
    sowMonth: 'February-March', sowWay: 'Planting suckers or tissue culture', nutrition: 'Potassium, Vitamin B6, Vitamin C',
    description: 'A fast-growing herbaceous plant, highly nutrient-demanding.', soil: 'Deep, rich, well-drained loam', waterNeeds: 'High'
  },
  carrot: {
    id: 'carrot', name: 'Carrot', type: 'fruit', seasons: ['Autumn', 'Winter'], daysToGrow: 2, buyPrice: 16, sellPrice: 46, xp: 20,
    sowMonth: 'August-October', sowWay: 'Direct sowing on ridges/beds', nutrition: 'Beta-carotene (Vit A), Vitamin K1',
    description: 'A root vegetable requiring loose soil to grow straight.', soil: 'Deep, loose, sandy loam', waterNeeds: 'Moderate'
  },
  mango: {
    id: 'mango', name: 'Mango', type: 'fruit', seasons: ['Summer'], daysToGrow: 4, buyPrice: 50, sellPrice: 180, xp: 60,
    sowMonth: 'July-August', sowWay: 'Grafting, planted in large pits', nutrition: 'Vitamin C, Vitamin A, Folate',
    description: 'The king of fruits, requires tropical/subtropical climates.', soil: 'Lateritic, alluvial, well-drained', waterNeeds: 'Moderate'
  },
  watermelon: {
    id: 'watermelon', name: 'Watermelon', type: 'fruit', seasons: ['Summer'], daysToGrow: 3, buyPrice: 20, sellPrice: 65, xp: 25,
    sowMonth: 'February-March', sowWay: 'Hill planting (2-3 seeds per mound)', nutrition: 'Vitamin C, Vitamin A, Hydration',
    description: 'A sprawling vine plant that thrives in intense summer heat.', soil: 'Sandy loam (rich in organic matter)', waterNeeds: 'High'
  },
  grapes: {
    id: 'grapes', name: 'Grapes', type: 'fruit', seasons: ['Summer', 'Autumn'], daysToGrow: 3, buyPrice: 35, sellPrice: 120, xp: 45,
    sowMonth: 'October-January', sowWay: 'Hardwood stem cuttings', nutrition: 'Antioxidants, Vit C, Vit K',
    description: 'A woody vine crop requiring trellising and regular pruning.', soil: 'Well-drained gravelly loam', waterNeeds: 'Moderate'
  },

  // --- VEGETABLES ---
  ladyfinger: {
    id: 'ladyfinger', name: 'Ladyfinger', type: 'vegetable', seasons: ['Spring', 'Summer'], daysToGrow: 2, buyPrice: 14, sellPrice: 40, xp: 18,
    sowMonth: 'February-March', sowWay: 'Dibbling seeds on raised beds', nutrition: 'Dietary Fiber, Vitamin C, Vitamin K',
    description: 'Also known as Okra. Thrives in warm, humid climates.', soil: 'Sandy to clay loam', waterNeeds: 'Moderate'
  },
  tomato: {
    id: 'tomato', name: 'Tomato', type: 'vegetable', seasons: ['Summer', 'Autumn'], daysToGrow: 2, buyPrice: 12, sellPrice: 34, xp: 15,
    sowMonth: 'May-June', sowWay: 'Nursery raising & transplanting', nutrition: 'Lycopene, Vitamin C, Potassium',
    description: 'A staple nightshade crop requiring staking and pruning.', soil: 'Well-drained sandy loam', waterNeeds: 'Moderate'
  },
  lemon: {
    id: 'lemon', name: 'Lemon', type: 'vegetable', seasons: ['Summer', 'Autumn'], daysToGrow: 3, buyPrice: 30, sellPrice: 100, xp: 35,
    sowMonth: 'July-August', sowWay: 'Seeds or vegetative budding', nutrition: 'High Vitamin C, Citric Acid',
    description: 'A small evergreen citrus tree. Highly sensitive to frost.', soil: 'Medium to light loamy soils', waterNeeds: 'Moderate'
  },
  cucumber: {
    id: 'cucumber', name: 'Cucumber', type: 'vegetable', seasons: ['Summer'], daysToGrow: 2, buyPrice: 10, sellPrice: 28, xp: 12,
    sowMonth: 'February-March', sowWay: 'Direct sowing on mounds/ridges', nutrition: 'Vitamin K, Potassium, 95% Water',
    description: 'A creeping vine plant. Highly responsive to organic manure.', soil: 'Rich sandy loam', waterNeeds: 'High'
  }
};

const EQUIPMENT = {
  scythe: {
    id: 'scythe', name: 'Scythe', type: 'equipment', buyPrice: 45,
    icon: '🗡️',
    description: 'A traditional hand tool with a curved blade used for mowing grass or reaping crops.',
    educationalFact: 'Historically, scythes revolutionized farming by allowing one person to harvest much more grain in a day compared to a sickle. Modern agriculture uses combine harvesters, but scythes are still used for managing weeds in small farms.',
    action: 'Clears all dead crops instantly.'
  },
  pickaxe: {
    id: 'pickaxe', name: 'Pickaxe', type: 'equipment', buyPrice: 80,
    icon: '⛏️',
    description: 'A T-shaped hand tool used for prying and breaking hard soil or rocks.',
    educationalFact: 'Pickaxes are essential for breaking up hard, compacted soil (hardpan) and removing large rocks to prepare land for plowing. Good soil aeration allows roots to penetrate deeper and access more nutrients.',
    action: 'Breaks rocks/debris.' 
  },
  sprinkler: {
    id: 'sprinkler', name: 'Sprinkler', type: 'equipment', buyPrice: 250,
    icon: '🚿',
    description: 'An automated device that sprays water over crops.',
    educationalFact: 'Sprinkler irrigation mimics natural rainfall and is much more efficient than traditional flood irrigation. It prevents soil erosion, reduces water wastage, and ensures even distribution of water across large crop fields.',
    action: 'Waters a 3x3 grid of crops automatically.'
  },
  scarecrow: {
    id: 'scarecrow', name: 'Scarecrow', type: 'equipment', buyPrice: 130,
    icon: '🧍',
    description: 'A decoy or mannequin placed in a field to deter birds.',
    educationalFact: 'Birds can decimate freshly sown seeds and ripe crops. Scarecrows are one of the oldest forms of pest control. Modern farms often use reflective tapes, noise cannons, or drones instead of traditional scarecrows.',
    action: 'Prevents crows from eating crops.'
  },
  neem_oil: {
    id: 'neem_oil', name: 'Neem Oil', type: 'equipment', buyPrice: 35, icon: '🧴',
    description: 'Organic pest control extracted from the Neem tree.',
    educationalFact: 'Unlike harsh chemical pesticides that kill beneficial insects and degrade soil, Neem oil acts as a natural repellent and disrupts the life cycle of pests while keeping ladybugs and earthworms safe.',
    action: 'Cures crops infected by pests.'
  },
  fertilizer: {
    id: 'fertilizer', name: 'Organic Fertilizer', type: 'equipment', buyPrice: 20, icon: '💩',
    description: 'Rich organic matter made from composted weeds.',
    educationalFact: 'Plants absorb Nitrogen, Phosphorus, and Potassium from the soil to grow. Without fertilizer, the dirt becomes depleted and dead. Composting creates a circular ecosystem where dead plants feed new plants!',
    action: 'Heals depleted soil so crops can grow again.'
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
  { id: 0, x: 250, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 1, x: 380, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 2, x: 510, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 3, x: 250, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 4, x: 380, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 5, x: 510, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 6, x: 250, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 7, x: 380, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 8, x: 510, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 2 (Right side) ---
  { id: 9, x: 880, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 10, x: 1010, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 11, x: 1140, y: 250, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 12, x: 880, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 13, x: 1010, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 14, x: 1140, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 15, x: 880, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 16, x: 1010, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 17, x: 1140, y: 510, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 3 (Bottom Left) ---
  { id: 18, x: 250, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 19, x: 380, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 20, x: 510, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 21, x: 250, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 22, x: 380, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 23, x: 510, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 24, x: 250, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 25, x: 380, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 26, x: 510, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 4 (Bottom Right) ---
  { id: 27, x: 880, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 28, x: 1010, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 29, x: 1140, y: 750, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 30, x: 880, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 31, x: 1010, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 32, x: 1140, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 33, x: 880, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 34, x: 1010, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 35, x: 1140, y: 1010, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
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
    ladyfinger: 0, tomato: 0, lemon: 0, cucumber: 0,
    biomass: 0, fertilizer: 2
  });
  
  const [harvested, setHarvested] = useState({ 
    wheat: 0, millet: 0, mustard: 0, bajra: 0,
    banana: 0, carrot: 0, mango: 0, watermelon: 0, grapes: 0,
    ladyfinger: 0, tomato: 0, lemon: 0, cucumber: 0
  });
  
  const [plots, setPlots] = useState(INITIAL_PLOTS);

  const [activeTool, setActiveTool] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopTab, setShopTab] = useState('seeds');
  const [hoveredInfoId, setHoveredInfoId] = useState(null);
  const [hoveredLeave, setHoveredLeave] = useState(false);
  const [unlockedEquipment, setUnlockedEquipment] = useState([]);
  
  // Market & Economy States
  const basePrices = Object.keys(CROPS).reduce((acc, key) => ({...acc, [key]: CROPS[key].sellPrice}), {});
  const [marketPrices, setMarketPrices] = useState(basePrices);
  const [marketTrend, setMarketTrend] = useState({ cropId: null, type: null, message: '' });

  // Educational Systems
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonsSeen, setLessonsSeen] = useState({ weeds: false, pests: false, soil: false, economics: false });
  
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

  const buyEquipment = (equip) => {
    if (unlockedEquipment.includes(equip.id)) return;
    if (spendCoins(equip.buyPrice)) {
      setUnlockedEquipment(prev => [...prev, equip.id]);
      earnXP(Math.floor(equip.buyPrice / 4));
      addNotification(`Bought ${equip.name}!`);
    }
  };
  
  const [playerPos, setPlayerPos] = useState({ x: 100, y: 350 });
  const [facing, setFacing] = useState(1);
  const keys = useRef({
    w: false, a: false, s: false, d: false,
    up: false, down: false, left: false, right: false
  });
  const velRef = useRef({ vx: 0, vy: 0 });
  const mapRef = useRef(null);

  // Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const currentSeason = SEASONS[Math.floor((day - 1) / DAYS_PER_SEASON) % 4];

  useEffect(() => {
    const handleKeyDown = (e) => { 
      const k = e.key.toLowerCase();
      if (k === 'w') keys.current.w = true;
      else if (k === 's') keys.current.s = true;
      else if (k === 'a') keys.current.a = true;
      else if (k === 'd') keys.current.d = true;
      else if (k === 'arrowup' || k === 'up') { e.preventDefault(); keys.current.up = true; }
      else if (k === 'arrowdown' || k === 'down') { e.preventDefault(); keys.current.down = true; }
      else if (k === 'arrowleft' || k === 'left') { e.preventDefault(); keys.current.left = true; }
      else if (k === 'arrowright' || k === 'right') { e.preventDefault(); keys.current.right = true; }
    };
    const handleKeyUp = (e) => { 
      const k = e.key.toLowerCase();
      if (k === 'w') keys.current.w = false;
      else if (k === 's') keys.current.s = false;
      else if (k === 'a') keys.current.a = false;
      else if (k === 'd') keys.current.d = false;
      else if (k === 'arrowup' || k === 'up') keys.current.up = false;
      else if (k === 'arrowdown' || k === 'down') keys.current.down = false;
      else if (k === 'arrowleft' || k === 'left') keys.current.left = false;
      else if (k === 'arrowright' || k === 'right') keys.current.right = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    let animationFrameId;
    const ACCEL = 0.72;
    const MAX_SPEED = 6.0;
    const FRICTION = 0.88;
    
    const loop = () => {
      let targetDx = 0;
      let targetDy = 0;

      if (keys.current.w || keys.current.up) targetDy -= 1;
      if (keys.current.s || keys.current.down) targetDy += 1;
      if (keys.current.a || keys.current.left) targetDx -= 1;
      if (keys.current.d || keys.current.right) targetDx += 1;

      // Normalize diagonal intent
      if (targetDx !== 0 && targetDy !== 0) {
        targetDx *= 0.7071;
        targetDy *= 0.7071;
      }

      const targetVx = targetDx * MAX_SPEED;
      const targetVy = targetDy * MAX_SPEED;

      let { vx, vy } = velRef.current;

      // Smooth acceleration when steering, smooth gliding friction when released
      if (targetDx !== 0) {
        vx += (targetVx - vx) * ACCEL;
      } else {
        vx *= FRICTION;
        if (Math.abs(vx) < 0.05) vx = 0;
      }

      if (targetDy !== 0) {
        vy += (targetVy - vy) * ACCEL;
      } else {
        vy *= FRICTION;
        if (Math.abs(vy) < 0.05) vy = 0;
      }

      velRef.current = { vx, vy };

      if (Math.abs(vx) > 0.3) {
        setFacing(vx > 0 ? 1 : -1);
      }

      setPlayerPos(p => {
        let nx = p.x + vx;
        let ny = p.y + vy;
        
        if (mapRef.current) {
          const mapHeight = 1400; // Expanded map height
          if (nx < 20) { nx = 20; velRef.current.vx = 0; }
          if (nx > 1516) { nx = 1516; velRef.current.vx = 0; } // 1536 - 20
          if (ny < 100) { ny = 100; velRef.current.vy = 0; }
          if (ny > mapHeight - 20) { ny = mapHeight - 20; velRef.current.vy = 0; }
          
          // Auto-scroll vertically if player nears edges of viewport
          const buffer = 150;
          if (ny > window.scrollY + window.innerHeight - buffer && vy > 0) {
             window.scrollBy(0, vy);
          } else if (ny < window.scrollY + buffer && vy < 0) {
             window.scrollBy(0, vy);
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

      // Fertilizer Cures Depleted Soil
      if (activeTool === 'fertilizer' && inventory.fertilizer > 0) {
        if (p.isDepleted) {
          setInventory(prev => ({ ...prev, fertilizer: prev.fertilizer - 1 }));
          addNotification("Organic Fertilizer restored the soil! 💩✨");
          return { ...p, isDepleted: false };
        }
      }

      // Neem Oil Cures Pests
      if (activeTool === 'neem_oil') {
        if (p.hasPests) {
          addNotification("Organic Neem Oil cured the pests! 🐛❌");
          return { ...p, hasPests: false };
        }
      }

      // Scythe clears weeds & dead crops -> Gives Biomass!
      if (activeTool === 'scythe') {
        if (p.hasWeed || p.state === 'dead') {
          setInventory(prev => ({ ...prev, biomass: (prev.biomass || 0) + 1 }));
          addNotification(p.hasWeed ? "Cleared a weed! +1 Biomass 🌿" : "Cleared dead crop! +1 Biomass 🥀");
          return { ...p, state: 'empty', cropId: null, daysPlanted: 0, isWatered: weather === 'rainy', hasPests: false, hasWeed: false };
        }
      }

      if (activeTool === 'harvest') {
        if (p.state === 'ready') {
          const totalStored = Object.values(harvested).reduce((a, b) => a + b, 0);
          if (totalStored >= 30) {
            addNotification("⚠️ Silo is full! Sell crops in the Shop.");
            return p;
          }

          const cropData = CROPS[p.cropId];
          earnXP(cropData.xp);
          setHarvested(prev => ({ ...prev, [p.cropId]: prev[p.cropId] + 1 }));
          addNotification(`${EMOJIS[p.cropId]} Harvested ${cropData.name}! Soil is now depleted.`);
          
          // HARVESTING DEPLETES THE SOIL
          if (!lessonsSeen.soil) {
             setActiveLesson('soil');
             setLessonsSeen(prev => ({...prev, soil: true}));
          }
          return { ...p, state: 'empty', cropId: null, daysPlanted: 0, isWatered: weather === 'rainy', hasPests: false, hasWeed: false, isDepleted: true };
        } else if (p.state === 'dead') {
          return { ...p, state: 'empty', cropId: null, daysPlanted: 0, isWatered: weather === 'rainy', hasPests: false, hasWeed: false };
        }
      }
      return p;
    }));
  };

  const sellAllCrop = (cropId) => {
    const qty = harvested[cropId];
    if (qty > 0) {
      setHarvested(prev => ({ ...prev, [cropId]: 0 }));
      const profit = marketPrices[cropId] * qty;
      addCoins(profit);
      addNotification(`Sold ${qty}x ${CROPS[cropId].name} for ${profit} coins!`);
    }
  };

  const [gameTime, setGameTime] = useState(360); // 360 = 6:00 AM

  useEffect(() => {
    // 1 real second = 10 in-game minutes
    const interval = setInterval(() => {
      setGameTime(prev => {
        if (prev + 10 >= 1560) {
          // 2:00 AM reached, trigger advanceDay via a timeout to avoid deep update conflicts
          setTimeout(() => {
            advanceDay();
          }, 0);
          return 360;
        }
        return prev + 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const advanceDay = () => {
    setDay(prevDay => {
      const nextDay = prevDay + 1;
      const nextSeason = SEASONS[Math.floor((nextDay - 1) / DAYS_PER_SEASON) % 4];
      
      const isRaining = Math.random() < 0.35;
      const nextWeather = isRaining ? 'rainy' : 'sunny';
      setWeather(nextWeather);

      // --- 1. COMPOST CONVERSION ---
      setInventory(prevInv => {
        let newFert = prevInv.fertilizer || 0;
        let newBiomass = prevInv.biomass || 0;
        if (newBiomass >= 3) {
          const created = Math.floor(newBiomass / 3);
          newFert += created;
          newBiomass %= 3;
          setTimeout(() => addNotification(`♻️ Compost bin created ${created} Organic Fertilizer!`), 1000);
        }
        return { ...prevInv, fertilizer: newFert, biomass: newBiomass };
      });

      // --- 2. MARKET FLUCTUATIONS ---
      let spawnedEconomyEvent = false;
      const newPrices = { ...basePrices };
      let trend = { cropId: null, type: null, message: '' };
      
      Object.keys(newPrices).forEach(key => {
        newPrices[key] = Math.floor(basePrices[key] * (0.8 + Math.random() * 0.4));
      });

      if (Math.random() < 0.3) {
        const cropsList = Object.keys(CROPS);
        const randomCrop = cropsList[Math.floor(Math.random() * cropsList.length)];
        const isShortage = Math.random() > 0.5;
        if (isShortage) {
          newPrices[randomCrop] = Math.floor(basePrices[randomCrop] * 3);
          trend = { cropId: randomCrop, type: 'shortage', message: `${CROPS[randomCrop].name} Shortage! Prices triple!` };
        } else {
          newPrices[randomCrop] = Math.floor(basePrices[randomCrop] * 0.3);
          trend = { cropId: randomCrop, type: 'surplus', message: `${CROPS[randomCrop].name} Surplus. Prices crashed.` };
        }
        spawnedEconomyEvent = true;
      }
      
      setMarketPrices(newPrices);
      setMarketTrend(trend);
      if (trend.message) {
        setTimeout(() => addNotification(`📈 Market Alert: ${trend.message}`), 500);
      }

      // --- 3. CROP GROWTH & EVENTS ---
      setPlots(currentPlots => {
        let spawnedWeed = false;
        let spawnedPest = false;

        const nextPlots = currentPlots.map(p => {
          let newPlot = { ...p };
          
          if (newPlot.hasPests) {
             newPlot.state = 'dead';
             newPlot.hasPests = false;
             return newPlot;
          }

          if (!newPlot.hasWeed && Math.random() < 0.10) {
             newPlot.hasWeed = true;
             spawnedWeed = true;
          }

          if ((newPlot.state === 'growing' || newPlot.state === 'seed') && !newPlot.hasPests && Math.random() < 0.08) {
             newPlot.hasPests = true;
             spawnedPest = true;
          }

          if (newPlot.state === 'empty' || newPlot.state === 'dead' || newPlot.state === 'ready') {
             newPlot.isWatered = isRaining;
          } else {
             const cropData = CROPS[newPlot.cropId];
             if (!cropData.seasons.includes(nextSeason)) {
               newPlot.state = 'dead';
               newPlot.isWatered = false;
               newPlot.hasPests = false;
             } else if (newPlot.isWatered && !newPlot.hasWeed && !newPlot.isDepleted) { 
               // Growth only happens if watered, no weeds, AND soil is healthy!
               const newDaysPlanted = newPlot.daysPlanted + 1;
               if (newDaysPlanted >= cropData.daysToGrow) {
                 newPlot.state = 'ready';
               } else {
                 newPlot.state = 'growing';
               }
               newPlot.daysPlanted = newDaysPlanted;
               newPlot.isWatered = isRaining;
             } else {
               newPlot.isWatered = isRaining;
             }
          }
          return newPlot;
        });

        // Trigger Lessons
        setTimeout(() => {
          setLessonsSeen(prev => {
            const nextLessons = { ...prev };
            if (spawnedWeed && !prev.weeds) {
              setActiveLesson('weeds');
              nextLessons.weeds = true;
            } else if (spawnedPest && !prev.pests) {
              setActiveLesson('pests');
              nextLessons.pests = true;
            } else if (spawnedEconomyEvent && !prev.economics) {
              setActiveLesson('economics');
              nextLessons.economics = true;
            }
            return nextLessons;
          });
        }, 0);

        return nextPlots;
      });

      if (isRaining) {
        setTimeout(() => addNotification("It's raining! All crops have been watered."), 1500);
      }
      
      return nextDay;
    });
    setGameTime(360);
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

  const [hoveredPlot, setHoveredPlot] = useState(null);

  const getCropEmoji = (cropId, state) => {
    if (state === 'dead') return EMOJIS.dead;
    if (state === 'ready') return EMOJIS[cropId];

    const varieties = {
      wheat: { seed: '🟤', growing: '🌾' },
      millet: { seed: '🟤', growing: '🌾' },
      mustard: { seed: '🟤', growing: '🌿' },
      bajra: { seed: '🟤', growing: '🌾' },
      banana: { seed: '🪴', growing: '🌴' },
      mango: { seed: '🪴', growing: '🌳' },
      lemon: { seed: '🪴', growing: '🌳' },
      carrot: { seed: '🌰', growing: '🥬' },
      watermelon: { seed: '🌰', growing: '🍃' },
      grapes: { seed: '🌰', growing: '🍃' },
      cucumber: { seed: '🌰', growing: '🍃' },
      ladyfinger: { seed: '🌱', growing: '🌿' },
      tomato: { seed: '🌱', growing: '🌿' },
    };

    const vars = varieties[cropId] || { seed: '🌱', growing: '🌿' };
    return vars[state] || EMOJIS.seed;
  };

  const renderCrop = (plot) => {
    if (plot.state === 'empty') return null;
    const emoji = getCropEmoji(plot.cropId, plot.state);
    
    return (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <span className={plot.state === 'growing' || plot.state === 'ready' ? 'farm-crop-sway' : ''} style={{ fontSize: plot.state === 'growing' ? '2.5rem' : '3rem', userSelect: 'none', display: 'inline-block' }}>{emoji}</span>
      </div>
    );
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
  const ownedCropIds = Object.keys(inventory).filter(id => inventory[id] > 0 && CROPS[id]);
  const displayedCropIds = ownedCropIds.slice(0, 6);
  const emptySlotsCount = Math.max(0, 6 - displayedCropIds.length);

  // Helper to render equipment category
  const renderEquipmentCategory = () => {
    const items = Object.values(EQUIPMENT);
    if (items.length === 0) return null;

    return (
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '20px', borderBottom: '3px solid #f1f5f9', paddingBottom: '8px' }}>
          🛠️ Advanced Farming Equipment
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {items.map(equip => {
            const isOwned = unlockedEquipment.includes(equip.id);
            return (
            <div key={`shop-${equip.id}`} style={{ backgroundColor: 'white', border: '3px solid #e2e8f0', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
              <div style={{ fontSize: '3rem', backgroundColor: '#f8fafc', minWidth: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '2px solid #f1f5f9' }}>
                {equip.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.15rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 4px 0' }}>
                  {equip.name}
                  
                  {/* Info Hover Button */}
                  <div 
                    onMouseEnter={() => {
                      if (window.hoverTimeout) clearTimeout(window.hoverTimeout);
                      setHoveredInfoId(equip.id);
                    }}
                    onMouseLeave={() => {
                      window.hoverTimeout = setTimeout(() => setHoveredInfoId(null), 300);
                    }}
                    style={{ cursor: 'help', display: 'inline-flex' }}
                  >
                    <Info size={20} color="#64748b" />
                  </div>
                </h3>
                <p style={{ color: '#64748b', fontWeight: 500, margin: '0 0 12px 0', fontSize: '0.875rem' }}>{equip.action}</p>
                
                <button
                  onClick={() => buyEquipment(equip)}
                  disabled={isOwned || player.coins < equip.buyPrice}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '16px', fontWeight: 900, fontSize: '1.125rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: (isOwned || player.coins < equip.buyPrice) ? 'not-allowed' : 'pointer', border: 'none',
                    ...(isOwned 
                      ? { backgroundColor: '#d1fae5', color: '#047857', border: '2px solid #34d399' }
                      : player.coins >= equip.buyPrice 
                        ? { backgroundColor: '#fef3c7', color: '#b45309', borderBottom: '4px solid #fcd34d' } 
                        : { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '2px solid #e2e8f0' })
                  }}
                >
                  {isOwned ? 'Owned' : `Buy for ${EMOJIS.coin} ${equip.buyPrice}`}
                </button>
              </div>

              {/* Educational Tooltip anchored to the CARD */}
              <AnimatePresence>
                {hoveredInfoId === equip.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onMouseEnter={() => {
                      if (window.hoverTimeout) clearTimeout(window.hoverTimeout);
                      setHoveredInfoId(equip.id);
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
                      {equip.name} Details
                    </div>
                    <p style={{ fontStyle: 'italic', color: '#64748b', margin: '0 0 12px 0' }}>{equip.description}</p>
                    
                    <div style={{ backgroundColor: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <strong style={{ color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '0.85rem' }}>
                        <span style={{ fontSize: '1.2em' }}>💡</span> Real World Fact
                      </strong>
                      <span style={{ color: '#78350f', fontWeight: 500, fontSize: '0.8rem', lineHeight: '1.6' }}>{equip.educationalFact}</span>
                    </div>
                    
                    <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #ffffff' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

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
    <div style={{ position: 'relative', width: '100%', minHeight: '1400px', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }} ref={mapRef} className="farm-world">
      

      {/* Decorative Environment — purely visual, no interactions */}
      <div className="farm-deco-tree" style={{ left: '50px', top: '120px' }} />
      <div className="farm-deco-tree" style={{ left: '1350px', top: '150px' }} />
      <div className="farm-deco-tree" style={{ left: '700px', top: '80px' }} />
      <div className="farm-deco-tree" style={{ left: '80px', top: '1200px' }} />
      <div className="farm-deco-tree" style={{ left: '1400px', top: '900px' }} />
      <div className="farm-deco-bush" style={{ left: '140px', top: '180px' }} />
      <div className="farm-deco-bush" style={{ left: '1300px', top: '600px' }} />
      <div className="farm-deco-bush" style={{ left: '680px', top: '1250px' }} />
      <div className="farm-deco-rock" style={{ left: '1450px', top: '450px' }} />
      <div className="farm-deco-rock" style={{ left: '100px', top: '650px' }} />
      <div className="farm-deco-flower" style={{ left: '1380px', top: '1100px' }} />
      <div className="farm-deco-flower" style={{ left: '60px', top: '900px' }} />
      <div className="farm-deco-flower" style={{ left: '720px', top: '1300px' }} />

      {/* Rain Animation Styles */}
      <style>
        {`
          @keyframes rainFall {
            0% { background-position: 0px 0px; }
            100% { background-position: 80px 800px; }
          }
        `}
      </style>

      {/* Background */}
      <div style={{ 
        position: 'absolute', inset: 0, opacity: 1, pointerEvents: 'none',
        /* old pattern removed */ 
        backgroundImage: 'repeating-linear-gradient(85deg, transparent 0px, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(95deg, transparent 0px, transparent 5px, rgba(0,0,0,0.04) 5px, rgba(0,0,0,0.04) 6px)' 
      }} />

      {/* Day/Night Ambient Lighting Overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10,
        backgroundColor: (() => {
          if (gameTime < 420) return 'rgba(15, 23, 42, 0.4)';      // 6 AM - 7 AM (Dawn)
          if (gameTime < 600) return 'rgba(255, 255, 255, 0.1)';   // 7 AM - 10 AM (Morning)
          if (gameTime < 960) return 'transparent';                // 10 AM - 4 PM (Noon)
          if (gameTime < 1140) return 'rgba(251, 146, 60, 0.2)';   // 4 PM - 7 PM (Evening/Sunset)
          return 'rgba(15, 23, 42, 0.5)';                          // After 7 PM (Night)
        })(),
        transition: 'background-color 2s ease'
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
              style={{ background: 'linear-gradient(135deg, rgba(60,40,20,0.92) 0%, rgba(30,20,10,0.95) 100%)', color: 'white', padding: '12px 24px', borderRadius: '32px', fontWeight: 'bold', boxShadow: '0 8px 24px rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(160,120,70,0.3)' }}
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
            backgroundColor: 'rgba(250,246,238,0.95)', backdropFilter: 'blur(10px)',
            borderRadius: '16px', boxShadow: '0 4px 16px rgba(30,20,10,0.2), inset 0 1px 0 rgba(255,255,255,0.6)', 
            border: '2px solid rgba(200,180,140,0.4)',
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
            
            {/* Day & Time & Next Button */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Day</span>
                  <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>{day}</span>
                </div>
                <button 
                  onClick={advanceDay}
                  title="Advance to Next Day"
                  style={{ 
                    background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderBottom: '2px solid #1d4ed8', 
                    padding: '4px 6px', borderRadius: '6px', fontWeight: 800, fontSize: '0.6rem', 
                    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em',
                    transform: 'translateY(-1px)'
                  }}
                >
                  Next ➔
                </button>
              </div>
              {/* REAL TIME CLOCK */}
              <div style={{ fontWeight: 800, color: '#475569', fontSize: '0.85rem', letterSpacing: '0.02em', backgroundColor: 'rgba(241,245,249,0.8)', padding: '2px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {(() => {
                  let h = Math.floor(gameTime / 60);
                  const m = gameTime % 60;
                  const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
                  h = h % 12;
                  if (h === 0) h = 12;
                  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                })()}
              </div>
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

          {/* Compost Bin */}
          <div style={{ backgroundColor: 'rgba(250,246,238,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 4px 16px rgba(30,20,10,0.2), inset 0 1px 0 rgba(255,255,255,0.6)', border: '2px solid rgba(200,180,140,0.4)', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h4 style={{ margin: 0, fontWeight: 900, fontSize: '0.8rem', color: '#15803d', display: 'flex', gap: '6px', alignItems: 'center' }}>♻️ COMPOST BIN</h4>
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>{inventory.biomass || 0} / 3 Biomass</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <div style={{ flex: 1, backgroundColor: '#d4c5a9', height: '8px', borderRadius: '4px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}>
                 <div style={{ backgroundColor: '#22c55e', height: '100%', width: `${((inventory.biomass || 0) % 3 / 3) * 100}%`, transition: 'width 0.3s ease' }} />
               </div>
               <span style={{ fontWeight: 900, color: '#8b5e3c', fontSize: '0.8rem' }}>💩 {inventory.fertilizer || 0}</span>
            </div>
          </div>
          
          {/* Market Alert Banner */}
          {marketTrend.message && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{ backgroundColor: marketTrend.type === 'shortage' ? '#fff1f2' : '#f0fdfa', borderRadius: '16px', padding: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `2px solid ${marketTrend.type === 'shortage' ? '#fecdd3' : '#ccfbf1'}`, marginTop: '8px' }}
             >
               <h4 style={{ margin: 0, fontWeight: 900, fontSize: '0.75rem', color: marketTrend.type === 'shortage' ? '#be123c' : '#0f766e', display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>📈 MARKET {marketTrend.type.toUpperCase()}</h4>
               <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>{marketTrend.message}</p>
             </motion.div>
          )}
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

            <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '5px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
              <motion.div 
                initial={false} 
                animate={{ width: `${(player.xp % 100)}%` }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #10b981 60%, #059669 100%)', borderRadius: '5px', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} 
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
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '12px'
        }} />

        {/* --- CROP PLOT FENCE 2 (Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '800px', top: '170px', width: '420px', height: '420px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '12px'
        }} />

        {/* --- CROP PLOT FENCE 3 (Bottom Left Grid) --- */}
        <div style={{
          position: 'absolute', left: '170px', top: '670px', width: '420px', height: '420px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '12px'
        }} />

        {/* --- CROP PLOT FENCE 4 (Bottom Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '800px', top: '670px', width: '420px', height: '420px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '12px'
        }} />

        {/* Farm Plots */}
        {plots.map((plot) => {
          const dist = Math.hypot(plot.x - playerPos.x, plot.y - playerPos.y);
          const isNear = dist < 120;
          let bg = plot.isWatered ? '#4a2e15' : '#7a5230';
          let border = plot.isWatered ? '#3a2210' : '#5c3a1e';
          
          if (plot.isDepleted) {
            bg = '#6b6560'; // Depleted cracked soil
            border = '#524d48';
          }
          
          return (
            <div
              key={plot.id}
              onClick={() => handlePlotInteraction(plot)}
              onMouseEnter={() => setHoveredPlot(plot.id)}
              onMouseLeave={() => setHoveredPlot(null)}
              style={{
                position: 'absolute', width: '110px', height: '110px',
                transform: 'translate(-50%, -50%)', borderRadius: '16px',
                border: `3px solid ${border}`, backgroundColor: bg,
                backgroundImage: plot.isDepleted 
                  ? 'radial-gradient(ellipse 15px 12px at 30% 35%, rgba(80,75,70,0.5) 0%, transparent 70%), radial-gradient(ellipse 10px 14px at 65% 60%, rgba(90,85,80,0.4) 0%, transparent 70%)'
                  : (plot.isWatered 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%), repeating-linear-gradient(0deg, transparent 0px, transparent 18px, rgba(0,0,0,0.14) 18px, rgba(0,0,0,0.14) 20px)'
                      : 'repeating-linear-gradient(0deg, transparent 0px, transparent 18px, rgba(0,0,0,0.1) 18px, rgba(0,0,0,0.1) 20px)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                left: plot.x, top: plot.y,
                cursor: isNear ? 'pointer' : 'not-allowed',
                opacity: isNear ? 1 : 0.85,
                boxShadow: isNear ? (plot.state === 'ready' ? '0 0 18px 4px rgba(250,204,21,0.3), inset 0 2px 6px rgba(0,0,0,0.25), 0 3px 8px rgba(30,20,10,0.3)' : '0 0 20px 6px rgba(255,255,255,0.2), inset 0 2px 6px rgba(0,0,0,0.25), 0 3px 8px rgba(30,20,10,0.3)') : 'inset 0 2px 6px rgba(0,0,0,0.3), 0 3px 8px rgba(30,20,10,0.25)',
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

              {/* Crop Info Tooltip */}
              <AnimatePresence>
                {hoveredPlot === plot.id && plot.state !== 'empty' && plot.state !== 'dead' && CROPS[plot.cropId] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute', bottom: '110%', backgroundColor: 'rgba(15,23,42,0.95)',
                      color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem',
                      fontWeight: 'bold', zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {CROPS[plot.cropId].name} <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '4px' }}>({plot.state})</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {plot.isWatered && (
                <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                  <Droplet size={20} color="#60a5fa" fill="#60a5fa" />
                </div>
              )}
              
              {plot.hasWeed && (
                <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', fontSize: '1.8rem', zIndex: 12, pointerEvents: 'none' }}>🌿</div>
              )}
              
              {plot.hasPests && (
                <div style={{ position: 'absolute', top: '-4px', left: '-4px', fontSize: '1.5rem', zIndex: 12, pointerEvents: 'none', animation: 'bounce 1s infinite alternate' }}>🐛</div>
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
            transform: 'translate(-50%, -100%)',
            transition: 'transform 0.05s linear'
          }}
        >
          <svg viewBox="-50 -150 100 200" width="100" height="200" style={{ overflow: 'visible' }}>
            <PlayerAvatar name={player.name} level={player.level} x={0} y={0} facing={facing} />
            
            {/* Equipped Tool Overlay */}
            <g transform={`scale(${facing}, 1)`}>
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
            </g>
          </svg>
        </div>
      </div>

      {/* Harvest Storage Panel */}
      <div style={{ 
        position: 'fixed', right: '16px', top: '150px', bottom: '180px', width: '220px', 
        backgroundColor: 'rgba(250,246,238,0.96)', backdropFilter: 'blur(10px)', 
        borderRadius: '24px', padding: '16px', boxShadow: '0 8px 24px rgba(30,20,10,0.25), inset 0 0 0 1px rgba(255,220,150,0.15)', 
        border: '3px solid #8b6239', display: 'flex', flexDirection: 'column', zIndex: 40 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px', borderBottom: '3px solid #f1f5f9', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e293b', margin: '0 0 4px 0' }}>
            📦 Silo Storage
          </h3>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: Object.values(harvested).reduce((a, b) => a + b, 0) >= 30 ? '#ef4444' : '#64748b' }}>
            Capacity: {Object.values(harvested).reduce((a, b) => a + b, 0)} / 30
          </span>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.keys(harvested).map(cropId => {
            if (harvested[cropId] === 0) return null;
            const crop = CROPS[cropId];
            return (
              <div key={`harvested-${cropId}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#faf6ee', padding: '8px 12px', borderRadius: '12px', border: '2px solid rgba(200,180,140,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{EMOJIS[cropId]}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.875rem' }}>{crop.name}</span>
                    <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.7rem' }}>
                      x{harvested[cropId]} | <span style={{ color: marketPrices[cropId] > crop.sellPrice ? '#10b981' : (marketPrices[cropId] < crop.sellPrice ? '#ef4444' : '#64748b') }}>{marketPrices[cropId]} coins/ea</span>
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => sellAllCrop(cropId)}
                  style={{ background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)', border: '2px solid #d4a017', color: '#8b6914', fontWeight: 800, fontSize: '0.75rem', padding: '4px 8px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(180,130,30,0.2)' }}
                >
                  Sell All
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
        
        {/* Tools Panel */}
        <div style={{ backgroundColor: 'rgba(250,246,238,0.96)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '8px', boxShadow: '0 -2px 20px rgba(30,20,10,0.2), inset 0 1px 0 rgba(255,255,255,0.5)', border: '3px solid #8b6239', display: 'flex', gap: '6px', flex: 1, justifyContent: 'flex-start', overflowX: 'auto', paddingRight: '12px' }}>
          
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
          />

          {inventory.fertilizer > 0 && (
            <ToolButton 
              active={activeTool === 'fertilizer'} 
              onClick={() => setActiveTool('fertilizer')}
              icon={<span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{EQUIPMENT['fertilizer'].icon}</span>}
              label={EQUIPMENT['fertilizer'].name}
              badge={inventory.fertilizer}
            />
          )}
          
          {unlockedEquipment.map(eqId => {
            const eq = EQUIPMENT[eqId];
            return (
              <ToolButton 
                key={`inv-eq-${eq.id}`}
                active={activeTool === eq.id} 
                onClick={() => setActiveTool(eq.id)}
                icon={<span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{eq.icon}</span>}
                label={eq.name}
              />
            );
          })}
          
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

          {/* Empty Slots */}
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
          style={{ display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', border: '3px solid #d4a017', background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)', color: '#8b6914', cursor: 'pointer', boxShadow: '0 4px 12px rgba(180,130,30,0.3), inset 0 1px 0 rgba(255,255,255,0.4)' }}
        >
          <Store size={24} style={{ marginBottom: '2px' }} />
          <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.05em' }}>SHOP</span>
        </button>
      </div>

      {/* Keyboard Controls Hint */}
      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 40, background: 'linear-gradient(135deg, rgba(60,40,20,0.75) 0%, rgba(40,25,12,0.8) 100%)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '16px', color: 'white', fontWeight: 500, fontSize: '0.875rem', border: '2px solid rgba(160,120,70,0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['W','A','S','D'].map(k => <kbd key={k} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{k}</kbd>)}
          </div>
          <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>or</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['↑','←','↓','→'].map(k => <kbd key={k} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '4px' }}>{k}</kbd>)}
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
            boxShadow: '0 6px 20px -4px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)', 
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

      {/* Educational Lesson Modal */}
      <AnimatePresence>
        {activeLesson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.65)', backdropFilter: 'blur(8px)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ background: 'linear-gradient(180deg, #faf6ee 0%, #f5efe3 100%)', padding: '32px', borderRadius: '32px', maxWidth: '600px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(16,185,129,0.2)', border: '5px solid #10b981' }}
            >
              {activeLesson === 'weeds' && (
                <>
                  <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '16px' }}>🌿</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#064e3b', textAlign: 'center', margin: '0 0 16px 0' }}>New Challenge: Weeds!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
                    A weed has sprouted on your farm! In agriculture, this causes <strong>Resource Competition</strong>.
                  </p>
                  <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '2px solid #bbf7d0', marginBottom: '24px' }}>
                    <h3 style={{ color: '#166534', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>📚</span> The Science
                    </h3>
                    <p style={{ color: '#15803d', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                      Plants need water, sunlight, and soil nutrients to survive. When a weed grows next to your crop, it steals those resources. 
                      Because of this, your crop will <strong>stop growing</strong> until you remove the weed!
                    </p>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'center', marginBottom: '32px' }}>
                    Equip your <strong style={{ color: '#0f172a' }}>Scythe</strong> and click on the plot to clear it.
                  </p>
                </>
              )}

              {activeLesson === 'pests' && (
                <>
                  <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '16px', animation: 'bounce 1s infinite alternate' }}>🐛</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#b45309', textAlign: 'center', margin: '0 0 16px 0' }}>New Challenge: Pests!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
                    Insects are attacking your crops! If you leave them alone, your plant will die tomorrow.
                  </p>
                  <div style={{ backgroundColor: '#fffbeb', padding: '20px', borderRadius: '16px', border: '2px solid #fde68a', marginBottom: '24px' }}>
                    <h3 style={{ color: '#92400e', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🔬</span> Integrated Pest Management (IPM)
                    </h3>
                    <p style={{ color: '#b45309', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                      Farmers must protect crops without destroying the environment. Instead of toxic chemicals that ruin the soil, 
                      you can use <strong>Organic Neem Oil</strong>. It repels pests naturally while keeping helpful insects (like Ladybugs) alive!
                    </p>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'center', marginBottom: '32px' }}>
                    Buy <strong style={{ color: '#0f172a' }}>Neem Oil</strong> from the Equipment Shop and use it to cure the plant!
                  </p>
                </>
              )}

              {activeLesson === 'soil' && (
                <>
                  <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '16px' }}>🍂</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#78716c', textAlign: 'center', margin: '0 0 16px 0' }}>Depleted Soil!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
                    You just harvested a crop, but look at the dirt! It has turned grey and cracked. 
                  </p>
                  <div style={{ backgroundColor: '#fafaf9', padding: '20px', borderRadius: '16px', border: '2px solid #e7e5e4', marginBottom: '24px' }}>
                    <h3 style={{ color: '#57534e', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>🧪</span> The Nitrogen Cycle
                    </h3>
                    <p style={{ color: '#44403c', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                      Growing plants suck nutrients (like Nitrogen) out of the dirt. If you don't replace them, the soil dies! 
                      Use your Scythe to cut weeds (adding Biomass to your Compost Bin). When you have 3 Biomass, it turns into Organic Fertilizer overnight!
                    </p>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'center', marginBottom: '32px' }}>
                    Equip <strong style={{ color: '#0f172a' }}>Organic Fertilizer</strong> (💩) to heal the depleted plot!
                  </p>
                </>
              )}

              {activeLesson === 'economics' && (
                <>
                  <div style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '16px' }}>📈</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0369a1', textAlign: 'center', margin: '0 0 16px 0' }}>Market Shift!</h2>
                  <p style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
                    Did you see that Market Alert? The prices of crops just changed drastically!
                  </p>
                  <div style={{ backgroundColor: '#f0f9ff', padding: '20px', borderRadius: '16px', border: '2px solid #bae6fd', marginBottom: '24px' }}>
                    <h3 style={{ color: '#0c4a6e', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>📊</span> Supply and Demand
                    </h3>
                    <p style={{ color: '#0369a1', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                      In economics, when everyone wants tomatoes but there aren't many (<strong>Shortage</strong>), the price goes UP! 
                      When farmers grow way too much of one thing (<strong>Surplus</strong>), the price crashes DOWN! 
                    </p>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, textAlign: 'center', marginBottom: '32px' }}>
                    Check your Silo Storage to see the real-time prices. Sell when prices are green (High)!
                  </p>
                </>
              )}

              <button 
                onClick={() => setActiveLesson(null)}
                style={{ width: '100%', padding: '16px', background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.25rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 6px 16px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                Got it! Let's Farm!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {isShopOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.6)', backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsShopOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'linear-gradient(180deg, #faf6ee 0%, #f0e8d8 100%)', 
                width: '85%', maxWidth: '1000px', 
                height: '85%', maxHeight: '750px', 
                borderRadius: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,220,150,0.15)', 
                display: 'flex', flexDirection: 'column', border: '5px solid #8b6239', overflow: 'hidden' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', borderBottom: '3px solid rgba(200,180,140,0.4)', background: 'linear-gradient(180deg, #fdfcf9 0%, #f5efe3 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '16px', margin: 0 }}>
                    <Store size={36} color="#f59e0b" />
                    Shop
                  </h2>
                  
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '16px' }}>
                    <button 
                      onClick={() => setShopTab('seeds')}
                      style={{ 
                        padding: '8px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        ...(shopTab === 'seeds' ? { backgroundColor: 'white', color: '#10b981', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : { backgroundColor: 'transparent', color: '#64748b' })
                      }}
                    >
                      🌱 Seeds
                    </button>
                    <button 
                      onClick={() => setShopTab('equipment')}
                      style={{ 
                        padding: '8px 24px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s',
                        ...(shopTab === 'equipment' ? { backgroundColor: 'white', color: '#3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } : { backgroundColor: 'transparent', color: '#64748b' })
                      }}
                    >
                      🛠️ Equipment
                    </button>
                  </div>
                </div>
                
                <button onClick={() => setIsShopOpen(false)} style={{ padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
                  <X size={28} color="#475569" />
                </button>
              </div>

              <div style={{ overflowY: 'auto', padding: '32px', paddingBottom: '200px' }}>
                {shopTab === 'seeds' && (
                  <>
                    {renderShopCategory('🌾 Crops', 'crop')}
                    {renderShopCategory('🍎 Fruits', 'fruit')}
                    {renderShopCategory('🥦 Vegetables', 'vegetable')}
                  </>
                )}
                {shopTab === 'equipment' && renderEquipmentCategory()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label, badge }) {
  const bg = active ? 'linear-gradient(180deg, #e8f4fd 0%, #d4ebf8 100%)' : 'linear-gradient(180deg, #fdfcf9 0%, #f5f0e6 100%)';
  const borderColor = active ? '#3b82f6' : '#c4b89a';
  const borderBottom = active ? '3px solid #2563eb' : '4px solid #b5a88e';
  const transform = active ? 'translateY(-2px)' : 'none';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '64px', height: '64px', borderRadius: '12px', background: bg, border: 'none', borderLeft: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderTop: `2px solid ${borderColor}`, borderBottom, transform, cursor: 'pointer', transition: 'all 0.12s ease', boxShadow: active ? '0 0 12px rgba(59,130,246,0.25)' : '0 2px 4px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ marginBottom: '2px', transform: 'scale(0.9)' }}>{icon}</div>
      <div style={{ fontSize: '0.55rem', fontWeight: 900, color: '#475569', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '56px' }}>{label}</div>
      
      {badge !== undefined && (
        <div style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: badge > 0 ? '#f43f5e' : '#94a3b8', color: 'white', fontSize: '0.65rem', fontWeight: 900, width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 0 0 2px white, 0 2px 4px rgba(0,0,0,0.15)' }}>
          {badge}
        </div>
      )}
    </button>
  );
}
