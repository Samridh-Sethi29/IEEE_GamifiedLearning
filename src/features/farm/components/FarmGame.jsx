import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '@/features/player/hooks/usePlayer';
import HomeAvatar from '@/features/home/components/HomeAvatar';
import { Droplet, Sun, Snowflake, Leaf, Sprout, Axe, Store, X, ArrowLeft, Play, Pause, SkipForward, Music, Volume2, VolumeX, Info, LogOut, CloudRain, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FarmGame.css';
import FarmVirtualControls from './FarmVirtualControls';

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
  // --- GRID 1 (Top-Left) ---
  { id: 0, x: 278, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 1, x: 380, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 2, x: 482, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 3, x: 278, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 4, x: 380, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 5, x: 482, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 6, x: 278, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 7, x: 380, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 8, x: 482, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 2 (Top-Right) ---
  { id: 9, x: 908, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 10, x: 1010, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 11, x: 1112, y: 278, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 12, x: 908, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 13, x: 1010, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 14, x: 1112, y: 380, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 15, x: 908, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 16, x: 1010, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 17, x: 1112, y: 482, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 3 (Bottom-Left) ---
  { id: 18, x: 278, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 19, x: 380, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 20, x: 482, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 21, x: 278, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 22, x: 380, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 23, x: 482, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 24, x: 278, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 25, x: 380, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 26, x: 482, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },

  // --- GRID 4 (Bottom-Right) ---
  { id: 27, x: 908, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 28, x: 1010, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 29, x: 1112, y: 778, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 30, x: 908, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 31, x: 1010, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 32, x: 1112, y: 880, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  
  { id: 33, x: 908, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 34, x: 1010, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
  { id: 35, x: 1112, y: 982, state: 'empty', cropId: null, daysPlanted: 0, isWatered: false, hasWeed: false, hasPests: false, isDepleted: false },
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
  const [isStorageOpen, setIsStorageOpen] = useState(false);
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
  const playerPosRef = useRef(playerPos);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  const [direction, setDirection] = useState('down');
  const [velocity, setVelocity] = useState({ vx: 0, vy: 0 });
  const [isWalking, setIsWalking] = useState(false);
  const directionRef = useRef('down');
  const isWalkingRef = useRef(false);
  const publishedVelRef = useRef({ vx: 0, vy: 0 });
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
      else if (k === 'e') {
        const dist = Math.hypot(1330 - playerPosRef.current.x, 210 - playerPosRef.current.y);
        if (dist < 165) {
          setIsStorageOpen(prev => !prev);
        }
      }
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
    
    const handleBlur = () => {
      keys.current = {
        w: false, a: false, s: false, d: false,
        up: false, down: false, left: false, right: false
      };
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    
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

      // Update direction based on velocity (identical to useHomeEngine.js)
      let nextDirection = directionRef.current;
      if (Math.abs(vx) > 0.3 || Math.abs(vy) > 0.3) {
        if (Math.abs(vx) > Math.abs(vy)) {
          nextDirection = vx > 0 ? 'right' : 'left';
        } else {
          nextDirection = vy > 0 ? 'down' : 'up';
        }
      }

      if (nextDirection !== directionRef.current) {
        directionRef.current = nextDirection;
        setDirection(nextDirection);
      }

      const currentSpeed = Math.hypot(vx, vy);
      const walking = currentSpeed > 0.2;
      if (walking !== isWalkingRef.current) {
        isWalkingRef.current = walking;
        setIsWalking(walking);
      }

      if (Math.hypot(vx - publishedVelRef.current.vx, vy - publishedVelRef.current.vy) > 0.1) {
        publishedVelRef.current = { vx, vy };
        setVelocity({ vx, vy });
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
      window.removeEventListener('blur', handleBlur);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleVirtualDirection = (dx, dy) => {
    keys.current.a = dx < -0.3;
    keys.current.d = dx > 0.3;
    keys.current.w = dy < -0.3;
    keys.current.s = dy > 0.3;
  };

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
      const profit = (marketPrices[cropId] || CROPS[cropId]?.sellPrice || 10) * qty;
      addCoins(profit);
      addNotification(`Sold ${qty}x ${CROPS[cropId].name} for ${profit} coins!`);
    }
  };

  const sellAllHarvest = () => {
    let totalProfit = 0;
    let totalSold = 0;
    const newHarvested = { ...harvested };
    
    Object.keys(harvested).forEach(cropId => {
      const qty = harvested[cropId];
      if (qty > 0) {
        totalProfit += (marketPrices[cropId] || CROPS[cropId]?.sellPrice || 10) * qty;
        totalSold += qty;
        newHarvested[cropId] = 0;
      }
    });

    if (totalSold > 0) {
      setHarvested(newHarvested);
      addCoins(totalProfit);
      addNotification(`Sold ${totalSold} crops for ${totalProfit} coins! 💰`);
    }
  };

  const totalStored = Object.values(harvested).reduce((a, b) => a + b, 0);

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

  const renderSeedStructure = (cropId) => {
    const isGrain = ['wheat', 'millet', 'bajra', 'mustard'].includes(cropId);
    const isTree = ['banana', 'mango', 'lemon'].includes(cropId);
    const isVine = ['carrot', 'watermelon', 'grapes', 'cucumber'].includes(cropId);

    return (
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width="46" height="36" viewBox="0 0 46 36" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))' }}>
          {/* Soil furrow mound */}
          <ellipse cx="23" cy="28" rx="19" ry="6" fill="#351d0d" />
          <ellipse cx="23" cy="27" rx="15" ry="4.5" fill="#4a2c15" />
          <path d="M 10 27 Q 23 29 36 27" stroke="#241207" strokeWidth="1.5" strokeLinecap="round" />

          {isGrain && (
            <g>
              <ellipse cx="18" cy="24" rx="3.5" ry="2" fill="#d97706" stroke="#b45309" strokeWidth="0.8" transform="rotate(-20 18 24)" />
              <ellipse cx="27" cy="25" rx="3" ry="1.8" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(15 27 25)" />
              <path d="M 22 24 Q 21 14 26 10" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 26 10 Q 30 8 31 12 Q 27 14 26 10" fill="#4ade80" />
            </g>
          )}

          {isTree && (
            <g>
              <path d="M 23 26 L 23 13" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 23 18 Q 14 15 15 20 Q 20 21 23 18" fill="#16a34a" />
              <path d="M 23 15 Q 32 12 31 17 Q 26 18 23 15" fill="#22c55e" />
              <ellipse cx="23" cy="12" rx="2.5" ry="3.5" fill="#86efac" />
            </g>
          )}

          {isVine && (
            <g>
              <ellipse cx="19" cy="24" rx="3.8" ry="2.2" fill="#451a03" stroke="#290f02" strokeWidth="0.8" transform="rotate(-15 19 24)" />
              <path d="M 22 24 Q 20 15 24 11" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 24 11 Q 29 9 28 14 Q 25 14 24 11" fill="#4ade80" />
              <circle cx="24" cy="11" r="1.5" fill="#86efac" />
            </g>
          )}

          {!isGrain && !isTree && !isVine && (
            <g>
              <path d="M 23 26 Q 23 18 23 12" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 23 16 Q 16 12 17 17 Q 21 18 23 16" fill="#22c55e" />
              <path d="M 23 15 Q 30 11 29 16 Q 25 17 23 15" fill="#4ade80" />
            </g>
          )}
        </svg>
      </div>
    );
  };

  const renderCrop = (plot) => {
    if (plot.state === 'empty') return null;
    if (plot.state === 'seed') {
      return renderSeedStructure(plot.cropId);
    }
    const emoji = getCropEmoji(plot.cropId, plot.state);
    
    return (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <span 
          className={plot.state === 'growing' || plot.state === 'ready' ? 'farm-crop-sway' : ''} 
          style={{ 
            fontSize: plot.state === 'growing' ? '2.1rem' : plot.state === 'ready' ? '2.4rem' : '1.9rem', 
            userSelect: 'none', 
            display: 'inline-block',
            filter: plot.state === 'ready' 
              ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.35)) drop-shadow(0 0 10px rgba(250,204,21,0.45))' 
              : 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))',
            transformOrigin: 'bottom center'
          }}
        >
          {emoji}
        </span>
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
      <DecoCobblestonePaths />

      {/* Scenic Fruit & Forest Trees */}
      <DecoTree x={90} y={150} variant="apple" scale={1.15} />
      <DecoTree x={1460} y={180} variant="oak" scale={1.2} />
      <DecoTree x={695} y={120} variant="maple" scale={1.1} />
      <DecoTree x={75} y={380} variant="oak" scale={0.95} />
      <DecoTree x={1410} y={430} variant="pine" scale={1.1} />
      <DecoTree x={95} y={1200} variant="maple" scale={1.15} />
      <DecoTree x={695} y={1250} variant="apple" scale={1.1} />
      <DecoTree x={1380} y={930} variant="oak" scale={1.1} />

      {/* Central Water Well & Washing Trough Area */}
      <DecoWaterWell x={695} y={290} />

      {/* Rustic Granary & Silo Storage Structure */}
      <DecoFarmStorage 
        x={1330} 
        y={210} 
        totalStored={totalStored} 
        onClick={() => setIsStorageOpen(true)} 
        isNear={Math.hypot(1330 - playerPos.x, 210 - playerPos.y) < 165} 
      />

      {/* Central Crossroads Signpost */}
      <DecoSignpost x={695} y={630} />

      {/* Cozy Amber Lantern Posts */}
      <DecoLanternPost x={565} y={540} />
      <DecoLanternPost x={825} y={540} />
      <DecoLanternPost x={565} y={705} />
      <DecoLanternPost x={825} y={705} />

      {/* Flower Gardens with Animated Butterflies */}
      <DecoFlowerBed x={100} y={630} />
      <DecoFlowerBed x={1340} y={1120} />

      {/* Rustic Hay Bales & Produce Storage Corner */}
      <DecoStorageCorner x={95} y={920} />

      {/* Tranquil Duck Pond with Reeds & Water Lotus */}
      <DecoDuckPond x={1260} y={680} />

      {/* Accent Natural Bushes & Rocks */}
      <div className="farm-deco-bush" style={{ left: '160px', top: '190px' }} />
      <div className="farm-deco-bush" style={{ left: '1290px', top: '560px' }} />
      <div className="farm-deco-bush" style={{ left: '630px', top: '1280px' }} />
      <div className="farm-deco-rock" style={{ left: '1440px', top: '480px' }} />
      <div className="farm-deco-rock" style={{ left: '120px', top: '690px' }} />
      <div className="farm-deco-flower" style={{ left: '60px', top: '990px' }} />
      <div className="farm-deco-flower" style={{ left: '760px', top: '1280px' }} />

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
      <div style={{ position: 'fixed', top: '12px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 40, pointerEvents: 'none' }}>
        
        {/* Left Side: Navigation & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', pointerEvents: 'auto', width: 'auto', alignItems: 'flex-start', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Back to Farm Button */}
            <Link
              to="/world/farm"
              onClick={() => markWorldCompleted('farm')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(250,246,238,0.96)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(30,20,10,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
                border: '2px solid rgba(200,180,140,0.45)',
                padding: '5px 12px',
                color: '#1e293b',
                fontWeight: 800,
                fontSize: '0.8rem',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Return to Farm World"
            >
              <ArrowLeft size={16} strokeWidth={2.5} color="#059669" />
              <span>Back to Farm</span>
            </Link>

            {/* 1. SLIM STATUS BAR (Season, Weather, Day, Next Day, Clock, Coins, Water) */}
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(250,246,238,0.96)', backdropFilter: 'blur(10px)',
              borderRadius: '14px', boxShadow: '0 4px 14px rgba(30,20,10,0.18), inset 0 1px 0 rgba(255,255,255,0.7)', 
              border: '2px solid rgba(200,180,140,0.45)',
              padding: '5px 12px'
            }}>
            {/* Season & Weather */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.85)' }}>
                {getSeasonIcon(currentSeason)}
              </div>
              <span style={{ fontWeight: 800, color: '#334155', fontSize: '0.8rem' }}>{currentSeason}</span>
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1px' }}>
                {weather === 'rainy' ? (
                  <CloudRain size={15} color="#3b82f6" title="Rainy" />
                ) : (
                  <Sun size={15} color="#f59e0b" title="Sunny" />
                )}
              </div>
            </div>
            
            {/* Divider */}
            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
            
            {/* Day & Next Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: '#064e3b', fontSize: '0.82rem' }}>Day {day}</span>
              <button 
                onClick={advanceDay}
                title="Advance to Next Day"
                style={{ 
                  background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderBottom: '2px solid #1d4ed8', 
                  padding: '2px 6px', borderRadius: '6px', fontWeight: 900, fontSize: '0.55rem', 
                  cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em',
                  transition: 'all 0.1s ease'
                }}
              >
                Next ➔
              </button>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

            {/* Clock */}
            <div style={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', letterSpacing: '0.02em', backgroundColor: 'rgba(241,245,249,0.85)', padding: '2px 6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {(() => {
                let h = Math.floor(gameTime / 60);
                const m = gameTime % 60;
                const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
                h = h % 12;
                if (h === 0) h = 12;
                return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
              })()}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
            
            {/* Coins */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', lineHeight: 1 }}>{EMOJIS.coin}</span>
              <span style={{ fontWeight: 900, color: '#b45309', fontSize: '0.85rem' }}>{player.coins}</span>
            </div>
            
            {/* Divider */}
            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(0,0,0,0.1)' }} />

            {/* Water */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#2563eb' }}>
              <Droplet size={15} fill="#bfdbfe" />
              <span style={{ fontWeight: 900, fontSize: '0.82rem' }}>{player.water}L</span>
            </div>
          </div>
          </div>

          {/* 2. SLIM COMPOST BAR */}
          <div style={{ 
            backgroundColor: 'rgba(250,246,238,0.95)', backdropFilter: 'blur(10px)', 
            borderRadius: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '8px', 
            boxShadow: '0 3px 10px rgba(30,20,10,0.15), inset 0 1px 0 rgba(255,255,255,0.6)', 
            border: '1.5px solid rgba(200,180,140,0.45)', width: 'fit-content' 
          }}>
            <span style={{ margin: 0, fontWeight: 900, fontSize: '0.72rem', color: '#15803d', display: 'flex', gap: '4px', alignItems: 'center' }}>
              ♻️ Compost:
            </span>
            <div style={{ width: '56px', backgroundColor: '#d4c5a9', height: '6px', borderRadius: '3px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)' }}>
              <div style={{ backgroundColor: '#22c55e', height: '100%', width: `${((inventory.biomass || 0) % 3 / 3) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b' }}>
              {inventory.biomass || 0}/3
            </span>
            <div style={{ width: '1px', height: '14px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
            <span style={{ fontWeight: 900, color: '#8b5e3c', fontSize: '0.75rem' }}>
              💩 {inventory.fertilizer || 0}
            </span>
          </div>
          
          {/* Market Alert Banner (Compact) */}
          {marketTrend.message && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               style={{ backgroundColor: marketTrend.type === 'shortage' ? '#fff1f2' : '#f0fdfa', borderRadius: '12px', padding: '4px 10px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)', border: `1.5px solid ${marketTrend.type === 'shortage' ? '#fecdd3' : '#ccfbf1'}`, display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content' }}
             >
               <span style={{ fontSize: '0.8rem' }}>{marketTrend.type === 'shortage' ? '📉' : '📈'}</span>
               <span style={{ fontSize: '0.75rem', fontWeight: 800, color: marketTrend.type === 'shortage' ? '#be123c' : '#0f766e' }}>
                 {marketTrend.message}
               </span>
             </motion.div>
          )}
        </div>

        {/* Right Side: Player Level & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', pointerEvents: 'auto', width: 'auto', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
          
          {/* 3. SLIM PLAYER LEVEL / XP BAR */}
          <div style={{ 
            backgroundColor: 'rgba(250,246,238,0.96)', backdropFilter: 'blur(10px)',
            borderRadius: '14px', boxShadow: '0 4px 14px rgba(30,20,10,0.18), inset 0 1px 0 rgba(255,255,255,0.7)', 
            border: '2px solid rgba(200,180,140,0.45)',
            padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            {/* Level Badge */}
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
              color: 'white', fontWeight: 900, fontSize: '0.75rem', 
              padding: '3px 8px', borderRadius: '8px', border: '1.5px solid #6ee7b7', 
              boxShadow: '0 2px 4px rgba(16,185,129,0.3)', whiteSpace: 'nowrap' 
            }}>
              Lv.{player.level}
            </div>

            {/* Name, XP & Progress Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '110px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#1e293b' }}>
                  {player.name}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.7rem', color: '#059669' }}>
                  {player.xp % 100} / 100 XP
                </span>
              </div>

              <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
                <motion.div 
                  initial={false} 
                  animate={{ width: `${(player.xp % 100)}%` }} 
                  transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #10b981 60%, #059669 100%)', borderRadius: '3px', boxShadow: '0 0 6px rgba(16,185,129,0.4)' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The World / Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        
        {/* --- CROP PLOT FENCE 1 (Top-Left Grid) --- */}
        <div style={{
          position: 'absolute', left: '210px', top: '210px', width: '340px', height: '340px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '14px'
        }} />

        {/* --- CROP PLOT FENCE 2 (Top-Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '840px', top: '210px', width: '340px', height: '340px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '14px'
        }} />

        {/* --- CROP PLOT FENCE 3 (Bottom-Left Grid) --- */}
        <div style={{
          position: 'absolute', left: '210px', top: '710px', width: '340px', height: '340px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '14px'
        }} />

        {/* --- CROP PLOT FENCE 4 (Bottom-Right Grid) --- */}
        <div style={{
          position: 'absolute', left: '840px', top: '710px', width: '340px', height: '340px',
          pointerEvents: 'none', opacity: 1, boxShadow: 'inset 0 0 0 4px #5c3a1e, inset 0 0 0 8px #8b6239, inset 0 0 0 10px rgba(255,220,150,0.25), 4px 6px 12px rgba(30,20,10,0.3)', borderRadius: '14px'
        }} />

        {/* Farm Plots */}
        {plots.map((plot) => {
          const dist = Math.hypot(plot.x - playerPos.x, plot.y - playerPos.y);
          const isNear = dist < 95;
          let bg = plot.isWatered ? '#422812' : '#734c2a';
          let border = plot.isWatered ? '#301c0c' : '#573418';
          
          if (plot.isDepleted) {
            bg = '#635d58'; // Depleted cracked soil
            border = '#4a4541';
          }

          const cropData = CROPS[plot.cropId];
          const daysRemaining = cropData ? Math.max(1, cropData.daysToGrow - plot.daysPlanted) : 1;
          
          return (
            <div
              key={plot.id}
              onClick={() => handlePlotInteraction(plot)}
              onMouseEnter={() => setHoveredPlot(plot.id)}
              onMouseLeave={() => setHoveredPlot(null)}
              style={{
                position: 'absolute', width: '84px', height: '84px',
                transform: 'translate(-50%, -50%)', borderRadius: '14px',
                border: `3px solid ${border}`, backgroundColor: bg,
                backgroundImage: plot.isDepleted 
                  ? 'radial-gradient(ellipse 12px 10px at 30% 35%, rgba(70,65,60,0.5) 0%, transparent 70%), radial-gradient(ellipse 8px 10px at 65% 60%, rgba(80,75,70,0.4) 0%, transparent 70%)'
                  : (plot.isWatered 
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%), repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.16) 13px, rgba(0,0,0,0.16) 15px)'
                      : 'repeating-linear-gradient(0deg, transparent 0px, transparent 13px, rgba(0,0,0,0.11) 13px, rgba(0,0,0,0.11) 15px)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                left: plot.x, top: plot.y,
                cursor: isNear ? 'pointer' : 'not-allowed',
                opacity: isNear ? 1 : 0.88,
                boxShadow: isNear 
                  ? (plot.state === 'ready' 
                      ? '0 0 16px 4px rgba(250,204,21,0.4), inset 0 2px 5px rgba(0,0,0,0.25), 0 3px 8px rgba(30,20,10,0.35)' 
                      : '0 0 16px 5px rgba(255,255,255,0.25), inset 0 2px 5px rgba(0,0,0,0.25), 0 3px 8px rgba(30,20,10,0.35)') 
                  : 'inset 0 2px 5px rgba(0,0,0,0.3), 0 2px 6px rgba(30,20,10,0.25)',
                transition: 'all 0.18s ease'
              }}
            >
              {/* Floating Growth / Status Countdown Badge */}
              {plot.state !== 'empty' && (
                <div style={{ position: 'absolute', top: '-11px', left: '50%', transform: 'translateX(-50%)', zIndex: 25, pointerEvents: 'none' }}>
                  {plot.state === 'ready' ? (
                    <div className="farm-ready-badge">
                      <span style={{ fontSize: '0.62rem' }}>✨</span>
                      <span>HARVEST</span>
                    </div>
                  ) : plot.state === 'dead' ? (
                    <div className="farm-dead-badge">
                      <span style={{ fontSize: '0.6rem' }}>🥀</span>
                      <span>Withered</span>
                    </div>
                  ) : (
                    <div className="farm-growth-badge">
                      <span style={{ fontSize: '0.62rem' }}>⏳</span>
                      <span>{daysRemaining}d left</span>
                    </div>
                  )}
                </div>
              )}

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
                {hoveredPlot === plot.id && plot.state !== 'empty' && plot.state !== 'dead' && cropData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: 'absolute', bottom: '110%', backgroundColor: 'rgba(15,23,42,0.95)',
                      color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem',
                      fontWeight: 'bold', zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'none',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    {cropData.name} <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: '4px' }}>({plot.state})</span>
                    {plot.state !== 'ready' && (
                      <span style={{ color: '#fbbf24', fontSize: '0.7rem', marginLeft: '6px' }}>• {daysRemaining}d left</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {plot.isWatered && (
                <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                  <Droplet size={16} color="#60a5fa" fill="#60a5fa" />
                </div>
              )}
              
              {plot.hasWeed && (
                <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', fontSize: '1.4rem', zIndex: 12, pointerEvents: 'none' }}>🌿</div>
              )}
              
              {plot.hasPests && (
                <div style={{ position: 'absolute', top: '-4px', left: '-4px', fontSize: '1.25rem', zIndex: 12, pointerEvents: 'none', animation: 'bounce 1s infinite alternate' }}>🐛</div>
              )}
              
              {plot.state === 'ready' && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(250,204,21,0.22)', borderRadius: '11px', pointerEvents: 'none' }} />
              )}
              
              {isNear && activeTool && (
                <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(255,255,255,0.45)', borderRadius: '11px', pointerEvents: 'none' }} />
              )}
            </div>
          );
        })}

        {/* Player Avatar with HomeWorld Animations */}
        <HomeAvatar
          pos={{ x: playerPos.x - 26, y: playerPos.y - 75 }}
          velocity={velocity}
          direction={direction}
          isWalking={isWalking}
          name={player.name}
          level={player.level}
          activeTool={activeTool}
          style={{ zIndex: 20 }}
        />
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
                icon={
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{EMOJIS[crop.id]}</span>
                    <span style={{ position: 'absolute', bottom: '-3px', right: '-6px', fontSize: '0.7rem', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>🌱</span>
                  </div>
                }
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

        {/* Silo Storage Button */}
        <button
          onClick={() => setIsStorageOpen(true)}
          style={{ 
            position: 'relative', display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            width: '64px', height: '64px', borderRadius: '20px', border: '3px solid #8b6239', 
            background: 'linear-gradient(180deg, #faf6ee 0%, #f0e8d8 100%)', color: '#5c3a1e', 
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,20,10,0.2), inset 0 1px 0 rgba(255,255,255,0.5)',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ fontSize: '1.4rem', lineHeight: 1, marginBottom: '2px' }}>📦</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.04em' }}>SILO</span>
          
          {totalStored > 0 && (
            <div style={{ 
              position: 'absolute', top: '-6px', right: '-6px', 
              backgroundColor: '#10b981', color: 'white', fontSize: '0.65rem', fontWeight: 900, 
              padding: '1px 6px', borderRadius: '10px', border: '2px solid white', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
            }}>
              {totalStored}
            </div>
          )}
        </button>

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
      <div className="hidden md:block" style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 40, background: 'linear-gradient(135deg, rgba(60,40,20,0.75) 0%, rgba(40,25,12,0.8) 100%)', backdropFilter: 'blur(8px)', borderRadius: '16px', padding: '16px', color: 'white', fontWeight: 500, fontSize: '0.875rem', border: '2px solid rgba(160,120,70,0.3)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
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
        <Link to="/world/farm" 
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
                Back to Farm
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

      {/* Silo & Granary Storage Modal */}
      <AnimatePresence>
        {isStorageOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, backgroundColor: 'rgba(20,15,8,0.65)', 
              backdropFilter: 'blur(6px)', zIndex: 50, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', padding: '16px' 
            }}
            onClick={() => setIsStorageOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                background: 'linear-gradient(180deg, #faf6ee 0%, #f0e8d8 100%)', 
                width: '100%', maxWidth: '750px', 
                maxHeight: '85vh', 
                borderRadius: '32px', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,220,150,0.15)', 
                display: 'flex', flexDirection: 'column', border: '5px solid #8b6239', overflow: 'hidden' 
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '3px solid rgba(200,180,140,0.4)', background: 'linear-gradient(180deg, #fdfcf9 0%, #f5efe3 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#fef3c7', border: '2px solid #d4a017', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 2px 6px rgba(180,130,30,0.2)' }}>
                    📦
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                      Granary & Silo Storage
                    </h2>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      Sell your harvested crops to town markets at live commodity prices.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsStorageOpen(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Capacity & Market Trends Bar */}
              <div style={{ padding: '16px 28px', backgroundColor: '#fcfaf6', borderBottom: '2px solid rgba(200,180,140,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 800 }}>
                    <span style={{ color: '#475569' }}>Silo Storage Capacity:</span>
                    <span style={{ color: totalStored >= 30 ? '#ef4444' : '#10b981' }}>{totalStored} / 30 items</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.min(100, (totalStored / 30) * 100)}%`,
                        background: totalStored >= 30 ? 'linear-gradient(90deg, #f87171, #ef4444)' : 'linear-gradient(90deg, #34d399, #10b981)',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: marketTrend.type === 'boom' ? '#dcfce7' : '#fef2f2', border: `1.5px solid ${marketTrend.type === 'boom' ? '#86efac' : '#fecaca'}`, padding: '6px 14px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '1rem' }}>{marketTrend.type === 'boom' ? '📈' : '📉'}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: marketTrend.type === 'boom' ? '#166534' : '#991b1b' }}>
                    {marketTrend.text}
                  </span>
                </div>
              </div>

              {/* Crop Items List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {totalStored > 0 ? (
                  Object.keys(harvested).map(cropId => {
                    const qty = harvested[cropId];
                    if (qty <= 0) return null;
                    const crop = CROPS[cropId];
                    const unitPrice = marketPrices[cropId] || crop.sellPrice;
                    const totalBatchPayout = unitPrice * qty;
                    const isAboveBase = unitPrice > crop.sellPrice;
                    const isBelowBase = unitPrice < crop.sellPrice;

                    return (
                      <div 
                        key={`silo-item-${cropId}`}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          backgroundColor: '#ffffff', padding: '14px 18px', borderRadius: '16px',
                          border: '2px solid rgba(200,180,140,0.4)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ fontSize: '2.4rem', width: '56px', height: '56px', borderRadius: '14px', backgroundColor: '#faf6ee', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e5e7eb' }}>
                            {EMOJIS[cropId]}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>{crop.name}</h4>
                              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#64748b' }}>
                                {crop.type}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                              <span>Stored: <strong style={{ color: '#0f172a' }}>x{qty}</strong></span>
                              <span>•</span>
                              <span>
                                Price: <strong style={{ color: isAboveBase ? '#059669' : (isBelowBase ? '#dc2626' : '#475569') }}>
                                  {unitPrice} coins
                                </strong> {isAboveBase && '🔥'} {isBelowBase && '❄️'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block' }}>Batch Total</span>
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#d97706' }}>+{totalBatchPayout} coins</span>
                          </div>
                          <button
                            onClick={() => sellAllCrop(cropId)}
                            style={{
                              background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
                              border: '2px solid #d4a017', borderBottom: '4px solid #b45309',
                              color: '#8b6914', fontWeight: 900, fontSize: '0.85rem',
                              padding: '10px 18px', borderRadius: '14px', cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(180,130,30,0.25)',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            Sell All
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌾</span>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: 900, color: '#334155' }}>Your Silo is Empty</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', maxWidth: '360px', lineHeight: 1.5 }}>
                      Harvest mature crops in your fields using the Scythe/Hand tool, and they will be automatically stored here for trading!
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer with Sell All Everything Button */}
              {totalStored > 0 && (
                <div style={{ padding: '16px 28px', backgroundColor: 'rgba(250,246,238,0.98)', borderTop: '3px solid rgba(200,180,140,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block' }}>Total Silo Value</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#d97706' }}>
                      {Object.keys(harvested).reduce((acc, cid) => acc + (marketPrices[cid] || CROPS[cid]?.sellPrice || 10) * harvested[cid], 0)} coins
                    </span>
                  </div>
                  <button
                    onClick={sellAllHarvest}
                    style={{
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                      border: 'none', borderBottom: '4px solid #047857',
                      color: 'white', fontWeight: 900, fontSize: '0.95rem',
                      padding: '12px 28px', borderRadius: '16px', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    Sell Everything 💰
                  </button>
                </div>
              )}
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

      {/* Virtual touch controls for mobile landscape */} 
      <FarmVirtualControls onDirectionChange={handleVirtualDirection} />
    </div>
  );
}

function ToolButton({ active, onClick, icon, label, badge }) {
  const bg = active ? 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(180deg, #fdfcf9 0%, #f5f0e6 100%)';
  const borderColor = active ? '#d97706' : '#c4b89a';
  const borderBottom = active ? '3px solid #b45309' : '4px solid #b5a88e';
  const transform = active ? 'translateY(-2px)' : 'none';

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexShrink: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '64px', height: '64px', borderRadius: '12px', background: bg, border: 'none', borderLeft: `2px solid ${borderColor}`, borderRight: `2px solid ${borderColor}`, borderTop: `2px solid ${borderColor}`, borderBottom, transform, cursor: 'pointer', transition: 'all 0.12s ease', boxShadow: active ? '0 0 14px rgba(245,158,11,0.4), 0 2px 6px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.08)'
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


/* ==========================================================
   SCENIC FARM ENVIRONMENTAL DECORATIONS (Purely Presentation)
   ========================================================== */

function DecoTree({ x, y, variant = 'apple', scale = 1 }) {
  const isApple = variant === 'apple';
  const isMaple = variant === 'maple';
  const isPine = variant === 'pine';

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: `translate(-50%, -85%) scale(${scale})`,
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <svg width="100" height="130" viewBox="0 0 100 130" fill="none" style={{ overflow: 'visible' }}>
        {/* Ground cast shadow */}
        <ellipse cx="50" cy="118" rx="42" ry="12" fill="rgba(20, 35, 15, 0.32)" />

        {/* Tree Trunk */}
        {!isPine ? (
          <g>
            {/* Roots */}
            <path d="M 44 116 Q 36 120 28 122 Q 40 118 45 112 Z" fill="#45230e" />
            <path d="M 56 116 Q 64 120 72 122 Q 60 118 55 112 Z" fill="#3a1b0a" />
            {/* Main Trunk with bark shading */}
            <path d="M 43 75 L 43 118 L 57 118 L 57 75 Z" fill="#5c3116" />
            <path d="M 50 75 L 50 118 L 57 118 L 57 75 Z" fill="#43220c" opacity="0.6" />
            <path d="M 46 88 Q 47 96 46 104" stroke="#361a08" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 53 82 Q 54 92 53 100" stroke="#361a08" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : (
          <rect x="46" y="90" width="8" height="28" fill="#45230e" rx="2" />
        )}

        {/* Canopy with gentle wind sway */}
        <g className="farm-tree-sway">
          {isPine ? (
            <g>
              <polygon points="50,15 22,60 78,60" fill="#14532d" />
              <polygon points="50,15 50,60 78,60" fill="#0f3d21" />
              <polygon points="50,42 16,84 84,84" fill="#166534" />
              <polygon points="50,42 50,84 84,84" fill="#114b27" />
              <polygon points="50,68 12,106 88,106" fill="#15803d" />
              <polygon points="50,68 50,106 88,106" fill="#14532d" />
            </g>
          ) : isMaple ? (
            <g>
              <circle cx="50" cy="55" r="38" fill="#b45309" />
              <circle cx="34" cy="58" r="26" fill="#d97706" />
              <circle cx="66" cy="58" r="26" fill="#92400e" />
              <circle cx="50" cy="40" r="28" fill="#f59e0b" />
              <circle cx="42" cy="38" r="18" fill="#fbbf24" opacity="0.8" />
              <circle cx="60" cy="46" r="16" fill="#d97706" opacity="0.9" />
              <ellipse cx="26" cy="98" rx="3" ry="1.8" fill="#d97706" transform="rotate(25 26 98)" />
              <ellipse cx="76" cy="104" rx="3" ry="1.6" fill="#f59e0b" transform="rotate(-30 76 104)" />
            </g>
          ) : (
            <g>
              <circle cx="50" cy="55" r="38" fill="#1b4332" />
              <circle cx="34" cy="58" r="26" fill="#2d6a4f" />
              <circle cx="66" cy="58" r="26" fill="#1e4d38" />
              <circle cx="50" cy="38" r="28" fill="#40916c" />
              <circle cx="40" cy="36" r="18" fill="#52b788" opacity="0.8" />
              <circle cx="62" cy="44" r="18" fill="#2d6a4f" opacity="0.9" />
              <circle cx="48" cy="28" r="14" fill="#74c69d" opacity="0.75" />

              {isApple && (
                <g>
                  <circle cx="32" cy="48" r="4.2" fill="#dc2626" />
                  <circle cx="31" cy="46.5" r="1.2" fill="#fecaca" />
                  <circle cx="64" cy="44" r="4.5" fill="#ef4444" />
                  <circle cx="63" cy="42.5" r="1.2" fill="#fecaca" />
                  <circle cx="46" cy="62" r="4.2" fill="#dc2626" />
                  <circle cx="45" cy="60.5" r="1.2" fill="#fecaca" />
                  <circle cx="56" cy="32" r="3.8" fill="#ef4444" />
                  <circle cx="38" cy="72" r="4" fill="#b91c1c" />
                  <circle cx="70" cy="116" r="3.5" fill="#dc2626" />
                  <ellipse cx="69" cy="114.5" rx="1" ry="0.6" fill="#fecaca" />
                </g>
              )}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

function DecoWaterWell({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ filter: 'drop-shadow(0 8px 12px rgba(20,25,15,0.35))' }}>
        {/* Cobblestone paving around well */}
        <ellipse cx="60" cy="98" rx="52" ry="18" fill="#57534e" opacity="0.4" />
        <ellipse cx="32" cy="95" rx="7" ry="4" fill="#78716c" opacity="0.7" />
        <ellipse cx="88" cy="96" rx="8" ry="4.5" fill="#78716c" opacity="0.7" />
        <ellipse cx="60" cy="108" rx="9" ry="5" fill="#a8a29e" opacity="0.6" />
        <ellipse cx="44" cy="103" rx="6" ry="3.5" fill="#78716c" opacity="0.7" />
        <ellipse cx="76" cy="103" rx="7" ry="4" fill="#655f58" opacity="0.7" />

        {/* Well Stone Base Cylinder */}
        <ellipse cx="60" cy="92" rx="32" ry="14" fill="#44403c" />
        <path d="M 28 72 L 28 92 C 28 102 92 102 92 92 L 92 72 Z" fill="#57534e" />
        {/* Stone texture bricks */}
        <path d="M 36 78 C 48 83 72 83 84 78" stroke="#44403c" strokeWidth="2" fill="none" />
        <path d="M 32 86 C 46 92 74 92 88 86" stroke="#44403c" strokeWidth="2" fill="none" />
        <line x1="46" y1="72" x2="46" y2="78" stroke="#44403c" strokeWidth="1.8" />
        <line x1="68" y1="72" x2="68" y2="78" stroke="#44403c" strokeWidth="1.8" />
        <line x1="56" y1="78" x2="56" y2="86" stroke="#44403c" strokeWidth="1.8" />
        <line x1="78" y1="78" x2="78" y2="86" stroke="#44403c" strokeWidth="1.8" />
        <line x1="42" y1="86" x2="42" y2="96" stroke="#44403c" strokeWidth="1.8" />
        <line x1="66" y1="86" x2="66" y2="97" stroke="#44403c" strokeWidth="1.8" />
        {/* Top Rim of Well */}
        <ellipse cx="60" cy="72" rx="32" ry="12" fill="#78716c" stroke="#44403c" strokeWidth="2.5" />
        {/* Inside Water Basin with Ripple */}
        <ellipse cx="60" cy="72" rx="24" ry="8" fill="#0284c7" />
        <ellipse cx="60" cy="72" rx="16" ry="5" fill="#38bdf8" opacity="0.6" className="farm-water-ripple" />
        <ellipse cx="60" cy="72" rx="8" ry="2.5" fill="#bae6fd" opacity="0.8" />

        {/* Wooden Posts */}
        <rect x="32" y="32" width="7" height="46" fill="#78350f" rx="1" />
        <rect x="32" y="32" width="3" height="46" fill="#92400e" opacity="0.7" />
        <rect x="81" y="32" width="7" height="46" fill="#542407" rx="1" />
        <rect x="81" y="32" width="3" height="46" fill="#78350f" opacity="0.7" />

        {/* Crossbeam with Winch & Rope */}
        <rect x="29" y="36" width="62" height="5" fill="#78350f" rx="1" />
        <rect x="54" y="34" width="12" height="8" fill="#d97706" rx="2" />
        <line x1="60" y1="42" x2="60" y2="58" stroke="#d97706" strokeWidth="2" />

        {/* Hanging Wooden Bucket */}
        <g transform="translate(54, 56)">
          <path d="M 1 4 L 3 14 L 9 14 L 11 4 Z" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <path d="M 0 4 Q 6 0 12 4" stroke="#78716c" strokeWidth="1.2" fill="none" />
          <ellipse cx="6" cy="5" rx="4" ry="1.5" fill="#0284c7" />
        </g>

        {/* Wooden Shingled Peaked Roof */}
        <polygon points="60,6 20,38 100,38" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
        <polygon points="60,6 60,38 100,38" fill="#713f12" />
        <line x1="42" y1="20" x2="36" y2="38" stroke="#451a03" strokeWidth="1.5" />
        <line x1="52" y1="12" x2="50" y2="38" stroke="#451a03" strokeWidth="1.5" />
        <line x1="68" y1="12" x2="70" y2="38" stroke="#451a03" strokeWidth="1.5" />
        <line x1="78" y1="20" x2="84" y2="38" stroke="#451a03" strokeWidth="1.5" />
        <polygon points="60,4 56,8 64,8" fill="#a16207" />

        {/* Cute resting bird on top */}
        <text x="60" y="5" fontSize="11" textAnchor="middle">🐦</text>

        {/* Wooden Water Trough beside well */}
        <g transform="translate(86, 78)">
          <rect x="0" y="6" width="30" height="15" rx="3" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <rect x="3" y="8" width="24" height="11" rx="2" fill="#0ea5e9" />
          <ellipse cx="15" cy="13" rx="10" ry="3.5" fill="#38bdf8" opacity="0.7" />
          <ellipse cx="9" cy="11" rx="1.5" ry="1" fill="#ffffff" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}

function DecoDuckPond({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <svg width="200" height="160" viewBox="0 0 200 160" fill="none" style={{ filter: 'drop-shadow(0 6px 14px rgba(10,30,35,0.35))' }}>
        {/* Sandy/Pebble Shoreline */}
        <path
          d="M 25 75 C 20 40 60 20 110 24 C 160 28 190 55 185 95 C 180 135 140 152 90 148 C 45 144 30 110 25 75 Z"
          fill="#c2b59b"
        />
        {/* Water Pond Basin */}
        <path
          d="M 32 75 C 28 46 64 28 110 32 C 154 36 180 60 176 94 C 172 128 136 143 92 140 C 52 136 36 104 32 75 Z"
          fill="url(#pondGradient)"
        />

        <defs>
          <linearGradient id="pondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
        </defs>

        {/* Water Ripple rings */}
        <ellipse cx="105" cy="85" rx="55" ry="26" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.4" className="farm-water-ripple" />
        <ellipse cx="105" cy="85" rx="35" ry="16" fill="none" stroke="#e0f2fe" strokeWidth="1" opacity="0.5" />

        {/* Shoreline Rocks */}
        <ellipse cx="28" cy="58" rx="7" ry="4.5" fill="#78716c" />
        <ellipse cx="40" cy="38" rx="8" ry="5" fill="#655f58" />
        <ellipse cx="145" cy="30" rx="9" ry="5" fill="#78716c" />
        <ellipse cx="178" cy="65" rx="7" ry="4" fill="#a8a29e" />
        <ellipse cx="165" cy="125" rx="8" ry="5" fill="#655f58" />
        <ellipse cx="120" cy="144" rx="7" ry="4" fill="#78716c" />
        <ellipse cx="50" cy="132" rx="9" ry="5.5" fill="#57534e" />

        {/* Cattails / Water Reeds */}
        <g transform="translate(162, 70)">
          <path d="M 0 35 Q 5 15 2 0" stroke="#15803d" strokeWidth="2" fill="none" />
          <rect x="0" y="4" width="4" height="14" rx="2" fill="#78350f" />
          <path d="M 8 35 Q 12 18 10 2" stroke="#16a34a" strokeWidth="1.8" fill="none" />
          <rect x="8" y="7" width="3.5" height="12" rx="1.8" fill="#5c2e0b" />
        </g>

        {/* Lily pad 1 with pink lotus */}
        <g transform="translate(60, 68)">
          <ellipse cx="10" cy="8" rx="11" ry="6" fill="#15803d" />
          <path d="M 10 8 L 21 6" stroke="#0369a1" strokeWidth="1.5" />
          <text x="10" y="10" fontSize="13" textAnchor="middle">🪷</text>
        </g>

        {/* Lily pad 2 */}
        <g transform="translate(125, 96)">
          <ellipse cx="9" cy="6" rx="9" ry="5" fill="#16a34a" />
          <path d="M 9 6 L 17 5" stroke="#0369a1" strokeWidth="1.2" />
        </g>

        {/* Peaceful Swimming Duck */}
        <g transform="translate(92, 74)">
          <text x="0" y="0" fontSize="22" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}>🦆</text>
          <path d="M -8 2 Q -16 -2 -22 2" stroke="#bae6fd" strokeWidth="1.2" fill="none" opacity="0.6" />
          <path d="M -8 6 Q -14 10 -20 8" stroke="#bae6fd" strokeWidth="1.2" fill="none" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

function DecoFlowerBed({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <div style={{ position: 'relative', width: '130px', height: '80px' }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '16px',
            backgroundColor: '#45220c',
            border: '4px solid #8b6239',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5), 0 6px 14px rgba(20,25,15,0.3)',
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)'
          }}
        />

        <div style={{ position: 'absolute', inset: '4px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', padding: '2px' }}>
          <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🌻</span>
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🌷</span>
          <span style={{ fontSize: '1.3rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🪻</span>
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🌼</span>
          <span style={{ fontSize: '1.4rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🌷</span>
          <span style={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>🌻</span>
        </div>

        <div style={{ position: 'absolute', top: '-14px', left: '20px' }} className="farm-butterfly-1">
          <span style={{ fontSize: '1.1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🦋</span>
        </div>
        <div style={{ position: 'absolute', top: '-6px', right: '15px' }} className="farm-butterfly-2">
          <span style={{ fontSize: '1rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🦋</span>
        </div>
      </div>
    </div>
  );
}

function DecoStorageCorner({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 6,
      }}
    >
      <div style={{ position: 'relative', width: '130px', height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', bottom: '0px', width: '124px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(50, 30, 15, 0.35)', filter: 'blur(2px)' }} />

        <div style={{ position: 'absolute', left: '10px', bottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '24px', borderRadius: '6px', background: 'linear-gradient(180deg, #fef08a 0%, #eab308 100%)', border: '2px solid #ca8a04', boxShadow: 'inset 0 0 0 2px rgba(254,240,138,0.4), 0 3px 6px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '-4px', zIndex: 2 }}>
            <span style={{ fontSize: '0.65rem' }}>🌾</span>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div style={{ width: '38px', height: '24px', borderRadius: '6px', background: 'linear-gradient(180deg, #fef08a 0%, #ca8a04 100%)', border: '2px solid #a16207', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }} />
            <div style={{ width: '38px', height: '24px', borderRadius: '6px', background: 'linear-gradient(180deg, #fef08a 0%, #ca8a04 100%)', border: '2px solid #a16207', boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', right: '12px', bottom: '10px', width: '42px', height: '32px', borderRadius: '6px', background: 'linear-gradient(180deg, #a16207 0%, #78350f 100%)', border: '2px solid #451a03', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px' }}>
          <div style={{ display: 'flex', gap: '2px', marginTop: '-12px' }}>
            <span style={{ fontSize: '0.9rem' }}>🥕</span>
            <span style={{ fontSize: '0.9rem' }}>🍎</span>
          </div>
          <div style={{ width: '100%', height: '3px', backgroundColor: '#451a03', margin: '2px 0' }} />
        </div>

        <div style={{ position: 'absolute', left: '72px', bottom: '14px', transform: 'rotate(18deg)', zIndex: 4 }}>
          <div style={{ width: '3px', height: '54px', backgroundColor: '#78350f', borderRadius: '2px' }}>
            <div style={{ position: 'absolute', top: '0', left: '-5px', fontSize: '0.8rem' }}>🍴</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DecoSignpost({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <div style={{ position: 'relative', width: '100px', height: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'absolute', bottom: '2px', width: '38px', height: '14px', borderRadius: '50%', backgroundColor: 'rgba(30, 20, 10, 0.4)', filter: 'blur(1px)' }} />
        <div style={{ position: 'absolute', bottom: '4px', width: '8px', height: '70px', background: 'linear-gradient(90deg, #78350f 0%, #542407 100%)', borderRadius: '2px', border: '1px solid #3b1803' }} />

        <div style={{ position: 'absolute', top: '10px', left: '-4px', background: 'linear-gradient(180deg, #d4a373 0%, #bc6c25 100%)', border: '1.5px solid #542407', borderRadius: '4px 0 0 4px', padding: '1px 6px', fontSize: '0.58rem', fontWeight: 900, color: '#fefae0', textShadow: '0 1px 2px rgba(0,0,0,0.7)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '2px' }}>
          <span>◀</span> W. Fields
        </div>

        <div style={{ position: 'absolute', top: '26px', right: '-4px', background: 'linear-gradient(180deg, #d4a373 0%, #bc6c25 100%)', border: '1.5px solid #542407', borderRadius: '0 4px 4px 0', padding: '1px 6px', fontSize: '0.58rem', fontWeight: 900, color: '#fefae0', textShadow: '0 1px 2px rgba(0,0,0,0.7)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '2px' }}>
          E. Fields <span>▶</span>
        </div>

        <div style={{ position: 'absolute', top: '42px', left: '6px', background: 'linear-gradient(180deg, #e9edc9 0%, #ccd5ae 100%)', border: '1.5px solid #542407', borderRadius: '4px', padding: '1px 5px', fontSize: '0.55rem', fontWeight: 900, color: '#283618', boxShadow: '0 2px 4px rgba(0,0,0,0.25)', whiteSpace: 'nowrap' }}>
          ▲ Water Well
        </div>
      </div>
    </div>
  );
}

function DecoLanternPost({ x, y }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -80%)',
        pointerEvents: 'none',
        zIndex: 7,
      }}
    >
      <div style={{ position: 'relative', width: '36px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'absolute', bottom: '0', width: '6px', height: '70px', background: 'linear-gradient(90deg, #78350f 0%, #451a03 100%)', borderRadius: '2px' }} />
        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '18px', height: '14px', borderTop: '3px solid #1e293b', borderRight: '3px solid #1e293b', borderRadius: '0 8px 0 0' }} />
        <div style={{ position: 'absolute', top: '16px', right: '-4px', width: '16px', height: '22px', borderRadius: '4px', background: 'linear-gradient(180deg, #fef08a 0%, #f59e0b 100%)', border: '1.5px solid #1e293b', boxShadow: '0 0 16px 6px rgba(251, 191, 36, 0.65), 0 2px 4px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="farm-lantern-glow">
          <div style={{ width: '6px', height: '10px', borderRadius: '2px', backgroundColor: '#ffffff', opacity: 0.9 }} />
        </div>
      </div>
    </div>
  );
}

function DecoCobblestonePaths() {
  const stones = [
    { x: 685, y: 390, rx: 14, ry: 9, rot: 10 },
    { x: 710, y: 430, rx: 16, ry: 10, rot: -15 },
    { x: 690, y: 475, rx: 15, ry: 9, rot: 5 },
    { x: 705, y: 520, rx: 17, ry: 10, rot: -8 },
    { x: 690, y: 565, rx: 15, ry: 9, rot: 12 },
    { x: 650, y: 620, rx: 18, ry: 11, rot: -5 },
    { x: 730, y: 620, rx: 18, ry: 11, rot: 8 },
    { x: 660, y: 645, rx: 16, ry: 10, rot: 15 },
    { x: 725, y: 645, rx: 17, ry: 10, rot: -12 },
    { x: 695, y: 685, rx: 16, ry: 10, rot: 6 },
    { x: 710, y: 730, rx: 15, ry: 9, rot: -10 },
    { x: 685, y: 775, rx: 17, ry: 10, rot: 14 },
    { x: 705, y: 820, rx: 15, ry: 9, rot: -7 },
    { x: 690, y: 865, rx: 16, ry: 10, rot: 9 },
    { x: 710, y: 910, rx: 15, ry: 9, rot: -12 },
    { x: 695, y: 955, rx: 16, ry: 10, rot: 5 },
    { x: 705, y: 1000, rx: 17, ry: 10, rot: -15 },
    { x: 575, y: 625, rx: 16, ry: 9, rot: 5 },
    { x: 610, y: 635, rx: 15, ry: 10, rot: -10 },
    { x: 780, y: 625, rx: 16, ry: 9, rot: -8 },
    { x: 815, y: 635, rx: 15, ry: 10, rot: 12 },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
      {stones.map((s, i) => (
        <div
          key={`stone-${i}`}
          style={{
            position: 'absolute',
            left: `${s.x}px`,
            top: `${s.y}px`,
            width: `${s.rx * 2}px`,
            height: `${s.ry * 2}px`,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) rotate(${s.rot}deg)`,
            background: 'linear-gradient(135deg, #d6d3d1 0%, #a8a29e 60%, #78716c 100%)',
            border: '1.5px solid #57534e',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 4px rgba(20,20,15,0.25)',
            opacity: 0.85
          }}
        />
      ))}
    </div>
  );
}


function DecoFarmStorage({ x, y, totalStored, onClick, isNear }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 8,
      }}
      className="farm-storage-building"
    >
      {/* Floating Status Pill Above Roof */}
      <div
        style={{
          position: 'absolute',
          top: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: totalStored > 0 ? 'rgba(30, 20, 10, 0.94)' : 'rgba(30, 20, 10, 0.85)',
          border: totalStored > 0 ? '2px solid #f59e0b' : '1.5px solid #8b6239',
          borderRadius: '14px',
          padding: '2px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: totalStored > 0 ? '0 0 14px rgba(245,158,11,0.5), 0 3px 6px rgba(0,0,0,0.35)' : '0 3px 6px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '0.75rem' }}>📦</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: totalStored > 0 ? '#fef08a' : '#e2e8f0' }}>
          {totalStored > 0 ? `Silo: ${totalStored}/30 • Click to Sell` : 'Silo Storage (0/30)'}
        </span>
      </div>

      {/* Proximity prompt when player is nearby */}
      {isNear && (
        <div
          style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#10b981',
            color: 'white',
            borderRadius: '10px',
            padding: '2px 8px',
            fontSize: '0.65rem',
            fontWeight: 900,
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
            zIndex: 12,
            animation: 'bounce 1s infinite alternate',
          }}
        >
          [Click or Press E] Open Silo
        </div>
      )}

      <svg width="250" height="220" viewBox="0 0 175 155" fill="none" style={{ overflow: 'visible', filter: 'drop-shadow(0 12px 22px rgba(20,25,15,0.45))' }}>
        {/* Ground shadow */}
        <ellipse cx="88" cy="144" rx="82" ry="14" fill="rgba(20, 30, 15, 0.38)" />

        {/* --- SILO TOWER (Right side) --- */}
        <g transform="translate(112, 18)">
          <rect x="0" y="28" width="50" height="100" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <line x1="0" y1="48" x2="50" y2="48" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="0" y1="68" x2="50" y2="68" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="0" y1="88" x2="50" y2="88" stroke="#94a3b8" strokeWidth="2.5" />
          <line x1="0" y1="108" x2="50" y2="108" stroke="#94a3b8" strokeWidth="2.5" />
          <rect x="0" y="28" width="10" height="100" fill="#f8fafc" opacity="0.6" />
          <rect x="36" y="28" width="14" height="100" fill="#64748b" opacity="0.4" />
          <line x1="12" y1="36" x2="12" y2="126" stroke="#475569" strokeWidth="1.8" />
          <line x1="20" y1="36" x2="20" y2="126" stroke="#475569" strokeWidth="1.8" />
          {[42, 52, 62, 72, 82, 92, 102, 112, 122].map(ly => (
            <line key={`ladder-${ly}`} x1="12" y1={ly} x2="20" y2={ly} stroke="#475569" strokeWidth="1.8" />
          ))}
          <path d="M 0 28 C 0 8 50 8 50 28 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <path d="M 5 28 C 5 12 45 12 45 28 Z" fill="#e2e8f0" opacity="0.4" />
          <rect x="23" y="2" width="4" height="8" fill="#475569" rx="1" />
        </g>

        {/* --- MAIN BARN STRUCTURE (Left/Center) --- */}
        <rect x="12" y="58" width="112" height="86" fill="#991b1b" stroke="#450a0a" strokeWidth="2.5" />
        {[26, 40, 54, 68, 82, 96, 110].map(px => (
          <line key={`plank-${px}`} x1={px} y1="58" x2={px} y2="144" stroke="#7f1d1d" strokeWidth="2" />
        ))}
        <rect x="10" y="138" width="116" height="8" fill="#57534e" stroke="#292524" strokeWidth="1.5" rx="1" />

        <polygon points="68,14 10,58 126,58" fill="#542407" stroke="#291102" strokeWidth="2.5" />
        <polygon points="68,14 68,58 126,58" fill="#3b1803" />
        <line x1="39" y1="36" x2="35" y2="58" stroke="#291102" strokeWidth="2" />
        <line x1="97" y1="36" x2="101" y2="58" stroke="#291102" strokeWidth="2" />
        <polygon points="68,11 6,58 12,61 68,17 124,61 130,58" fill="#d97706" />
        <rect x="66" y="4" width="4" height="10" fill="#291102" />
        <text x="68" y="5" fontSize="14" textAnchor="middle">🐓</text>

        <rect x="58" y="30" width="20" height="20" fill="#3b1803" stroke="#d97706" strokeWidth="2" rx="2" />
        <line x1="68" y1="30" x2="68" y2="50" stroke="#d97706" strokeWidth="1.5" />
        <line x1="58" y1="40" x2="78" y2="40" stroke="#d97706" strokeWidth="1.5" />

        <rect x="42" y="86" width="52" height="54" fill="#3b1803" stroke="#291102" strokeWidth="2" />
        <rect x="44" y="88" width="23" height="50" fill="#7f1d1d" stroke="#f8fafc" strokeWidth="1.8" />
        <line x1="44" y1="88" x2="67" y2="138" stroke="#f8fafc" strokeWidth="2" />
        <line x1="67" y1="88" x2="44" y2="138" stroke="#f8fafc" strokeWidth="2" />
        <rect x="69" y="88" width="23" height="50" fill="#7f1d1d" stroke="#f8fafc" strokeWidth="1.8" />
        <line x1="69" y1="88" x2="92" y2="138" stroke="#f8fafc" strokeWidth="2" />
        <line x1="92" y1="88" x2="69" y2="138" stroke="#f8fafc" strokeWidth="2" />

        <rect x="36" y="66" width="64" height="15" rx="3" fill="#faf6ee" stroke="#8b6239" strokeWidth="2" />
        <text x="68" y="77" fontSize="8" fontWeight="900" fill="#5c3a1e" textAnchor="middle" letterSpacing="0.5">GRANARY & SILO</text>

        <g transform="translate(100, 72)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#1e293b" strokeWidth="1.5" />
          <rect x="-4" y="6" width="8" height="11" rx="2" fill="#f59e0b" stroke="#1e293b" strokeWidth="1" className="farm-lantern-glow" />
          <circle cx="0" cy="11.5" r="2" fill="#ffffff" />
        </g>

        <g transform="translate(18, 120)">
          <path d="M 2 24 C 0 16 2 8 8 6 C 14 8 16 16 14 24 Z" fill="#d4a373" stroke="#8b5a2b" strokeWidth="1.5" />
          <ellipse cx="8" cy="7" rx="4" ry="2" fill="#bc6c25" />
          <text x="8" y="18" fontSize="8" textAnchor="middle">🌾</text>
        </g>
        <g transform="translate(98, 118)">
          <ellipse cx="10" cy="5" rx="9" ry="4" fill="#a16207" stroke="#451a03" strokeWidth="1.5" />
          <path d="M 1 5 L 3 24 L 17 24 L 19 5 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <line x1="2" y1="12" x2="18" y2="12" stroke="#1e293b" strokeWidth="1.8" />
          <line x1="3" y1="18" x2="17" y2="18" stroke="#1e293b" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}
