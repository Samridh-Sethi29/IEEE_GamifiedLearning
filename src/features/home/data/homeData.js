// Home Learning World – central data definitions
// Rooms, interactive stations, mini-game content, and layout configuration.

export const ROOMS = {
  living: { id: 'living', name: 'Living Room', x: 0, y: 0, w: 1200, h: 900, bg: '#f5edd6' },
  kitchen: { id: 'kitchen', name: 'Kitchen', x: 1200, y: 0, w: 1200, h: 900, bg: '#fef3e2' },
  bedroom: { id: 'bedroom', name: 'Bedroom', x: 0, y: 900, w: 1200, h: 900, bg: '#f0e8f5' },
  bathroom: { id: 'bathroom', name: 'Bathroom', x: 1200, y: 900, w: 1200, h: 900, bg: '#e8f4f8' },
  garden: { id: 'garden', name: 'Garden', x: 2400, y: 0, w: 1200, h: 900, bg: '#e8f5e0' },
  safety: { id: 'safety', name: 'Safety Corner', x: 2400, y: 900, w: 1200, h: 900, bg: '#fff5e6' },
};

// The full home map dimensions
export const HOME_MAP = { width: 3600, height: 1800 };

// Interactive stations placed throughout the home
export const STATIONS = [
  // Living Room
  { id: 'waste', room: 'living', x: 280, y: 580, label: 'Sort the Waste', icon: '🗑️', game: 'waste', coins: 20, xp: 15 },
  { id: 'electricity', room: 'living', x: 850, y: 380, label: 'Save Electricity', icon: '💡', game: 'electricity', coins: 15, xp: 10 },
  { id: 'clean', room: 'living', x: 550, y: 700, label: 'Clean & Organise', icon: '🧹', game: 'clean', coins: 20, xp: 15 },
  // Kitchen
  { id: 'food', room: 'kitchen', x: 1500, y: 400, label: 'Healthy Food Sort', icon: '🥗', game: 'food', coins: 20, xp: 15 },
  { id: 'spice', room: 'kitchen', x: 1850, y: 350, label: 'Spice Discovery', icon: '🫙', game: 'spice', coins: 15, xp: 10 },
  { id: 'water', room: 'kitchen', x: 1650, y: 650, label: 'Save Water', icon: '💧', game: 'water', coins: 15, xp: 10 },
  { id: 'shopping', room: 'kitchen', x: 2100, y: 500, label: 'Smart Shopping', icon: '🛒', game: 'shopping', coins: 25, xp: 20 },
  // Bedroom
  { id: 'weather', room: 'bedroom', x: 350, y: 1350, label: 'Dress for Weather', icon: '👔', game: 'weather', coins: 20, xp: 15 },
  { id: 'routine', room: 'bedroom', x: 750, y: 1500, label: 'Daily Routine', icon: '⏰', game: 'routine', coins: 15, xp: 10 },
  // Bathroom
  { id: 'laundry', room: 'bathroom', x: 1550, y: 1400, label: 'Laundry Sorting', icon: '👕', game: 'laundry', coins: 15, xp: 10 },
  // Garden
  { id: 'plant', room: 'garden', x: 2700, y: 450, label: 'Plant Care', icon: '🌱', game: 'plant', coins: 20, xp: 15 },
  // Safety Corner
  { id: 'safety', room: 'safety', x: 2800, y: 1350, label: 'Safety Detective', icon: '🛡️', game: 'safety_game', coins: 25, xp: 20 },
];

// Collision boundaries (rectangles that block movement)
// Format: { x, y, w, h } in world coordinates
export const COLLISIONS = [
  // Living Room walls
  { x: -20, y: -20, w: 3640, h: 40 }, // top wall
  { x: -20, y: -20, w: 40, h: 1840 }, // left wall
  { x: 3580, y: -20, w: 40, h: 1840 }, // right wall
  { x: -20, y: 1780, w: 3640, h: 40 }, // bottom wall
  // Living Room furniture
  { x: 80, y: 200, w: 250, h: 120 }, // sofa
  { x: 900, y: 150, w: 200, h: 100 }, // TV stand
  { x: 80, y: 600, w: 60, h: 200 }, // bookshelf
  // Kitchen furniture
  { x: 1250, y: 100, w: 300, h: 80 }, // counter
  { x: 1700, y: 100, w: 200, h: 100 }, // fridge
  { x: 1900, y: 100, w: 250, h: 80 }, // cupboards
  { x: 1500, y: 600, w: 200, h: 80 }, // dining table
  // Bedroom furniture
  { x: 80, y: 1050, w: 350, h: 200 }, // bed
  { x: 80, y: 1400, w: 100, h: 250 }, // wardrobe
  { x: 900, y: 1050, w: 200, h: 100 }, // desk
  // Bathroom
  { x: 1250, y: 1050, w: 200, h: 100 }, // sink area
  { x: 1700, y: 1050, w: 200, h: 200 }, // shower
  { x: 1400, y: 1500, w: 150, h: 120 }, // washing machine
  // Garden
  { x: 2500, y: 100, w: 400, h: 60 }, // fence
  { x: 2850, y: 300, w: 100, h: 100 }, // big plant
  // Safety Corner
  { x: 2500, y: 1050, w: 150, h: 80 }, // equipment shelf
  // Room dividers (thin walls between rooms)
  { x: 1170, y: 0, w: 30, h: 350 },
  { x: 1170, y: 550, w: 30, h: 350 },
  { x: 1170, y: 900, w: 30, h: 350 },
  { x: 1170, y: 1450, w: 30, h: 350 },
  { x: 2370, y: 0, w: 30, h: 350 },
  { x: 2370, y: 550, w: 30, h: 350 },
  { x: 2370, y: 900, w: 30, h: 350 },
  { x: 2370, y: 1450, w: 30, h: 350 },
  { x: 0, y: 870, w: 450, h: 30 },
  { x: 750, y: 870, w: 450, h: 30 },
  { x: 1200, y: 870, w: 450, h: 30 },
  { x: 1950, y: 870, w: 450, h: 30 },
  { x: 2400, y: 870, w: 450, h: 30 },
  { x: 3150, y: 870, w: 450, h: 30 },
];

// ─── GAME DATA ────────────────────────────────────────────────

export const WASTE_ITEMS = [
  { id: 'banana', name: 'Banana Peel', emoji: '🍌', bin: 'wet', fact: 'Banana peels are biodegradable and decompose naturally.' },
  { id: 'veggie', name: 'Vegetable Scraps', emoji: '🥬', bin: 'wet', fact: 'Vegetable scraps make great compost for gardens.' },
  { id: 'eggshell', name: 'Eggshells', emoji: '🥚', bin: 'wet', fact: 'Eggshells are biodegradable and rich in calcium for compost.' },
  { id: 'newspaper', name: 'Newspaper', emoji: '📰', bin: 'dry', fact: 'Newspapers are recyclable and can be turned into new paper.' },
  { id: 'cardboard', name: 'Cardboard Box', emoji: '📦', bin: 'dry', fact: 'Cardboard can be recycled many times into new products.' },
  { id: 'plastic', name: 'Plastic Bottle', emoji: '🧴', bin: 'dry', fact: 'Plastic bottles can be recycled into new bottles or fabric.' },
  { id: 'glass', name: 'Glass Jar', emoji: '🫙', bin: 'dry', fact: 'Glass can be recycled endlessly without losing quality.' },
  { id: 'battery', name: 'Used Battery', emoji: '🔋', bin: 'ewaste', fact: 'Batteries contain chemicals that need special disposal to protect the environment.' },
  { id: 'phone', name: 'Old Phone', emoji: '📱', bin: 'ewaste', fact: 'Old electronics should be taken to e-waste collection centres for safe recycling.' },
  { id: 'teabag', name: 'Used Tea Bag', emoji: '🍵', bin: 'wet', fact: 'Tea bags (without staples) are compostable organic waste.' },
];

export const WEATHER_SCENARIOS = [
  {
    id: 'summer',
    name: 'Hot Summer Day',
    temp: '38°C',
    emoji: '☀️',
    description: 'It is a bright, hot summer day with clear skies.',
    correct: ['tshirt', 'shorts', 'sandals', 'cap', 'sunglasses'],
    explanation: 'Light, breathable clothes keep you cool. A cap and sunglasses protect from the sun.',
  },
  {
    id: 'rainy',
    name: 'Rainy Day',
    temp: '24°C',
    emoji: '🌧️',
    description: 'Dark clouds and steady rain all morning.',
    correct: ['raincoat', 'umbrella', 'boots', 'fullpants', 'longsleeve'],
    explanation: 'Waterproof clothing and an umbrella keep you dry in the rain.',
  },
  {
    id: 'winter',
    name: 'Cold Winter Morning',
    temp: '5°C',
    emoji: '❄️',
    description: 'A chilly winter morning with frost on the ground.',
    correct: ['sweater', 'jacket', 'scarf', 'fullpants', 'boots', 'gloves'],
    explanation: 'Warm layers, a jacket, and a scarf help you stay warm in cold weather.',
  },
  {
    id: 'windy',
    name: 'Windy Day',
    temp: '20°C',
    emoji: '💨',
    description: 'A breezy day with strong gusts of wind.',
    correct: ['jacket', 'fullpants', 'sneakers', 'longsleeve'],
    explanation: 'A jacket shields from wind. Avoid loose accessories that might blow away.',
  },
];

export const CLOTHING_ITEMS = [
  { id: 'tshirt', name: 'T-Shirt', emoji: '👕', type: 'top' },
  { id: 'longsleeve', name: 'Long Sleeve Shirt', emoji: '🧥', type: 'top' },
  { id: 'sweater', name: 'Sweater', emoji: '🧶', type: 'top' },
  { id: 'jacket', name: 'Jacket', emoji: '🧥', type: 'outer' },
  { id: 'raincoat', name: 'Raincoat', emoji: '🧥', type: 'outer' },
  { id: 'shorts', name: 'Shorts', emoji: '🩳', type: 'bottom' },
  { id: 'fullpants', name: 'Full Pants', emoji: '👖', type: 'bottom' },
  { id: 'sandals', name: 'Sandals', emoji: '🩴', type: 'foot' },
  { id: 'sneakers', name: 'Sneakers', emoji: '👟', type: 'foot' },
  { id: 'boots', name: 'Boots', emoji: '🥾', type: 'foot' },
  { id: 'cap', name: 'Cap', emoji: '🧢', type: 'accessory' },
  { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️', type: 'accessory' },
  { id: 'scarf', name: 'Scarf', emoji: '🧣', type: 'accessory' },
  { id: 'gloves', name: 'Gloves', emoji: '🧤', type: 'accessory' },
  { id: 'umbrella', name: 'Umbrella', emoji: '☂️', type: 'accessory' },
];

export const SPICE_DATA = [
  { id: 'turmeric', name: 'Turmeric', emoji: '🟡', color: '#f0b429', dish: 'Dal (Lentil Curry)', fact: 'Turmeric gives curry its golden-yellow colour and is widely used in cooking.' },
  { id: 'cumin', name: 'Cumin', emoji: '🟤', color: '#8B6914', dish: 'Jeera Rice', fact: 'Cumin seeds add a warm, earthy flavour and are used in many dishes worldwide.' },
  { id: 'coriander', name: 'Coriander', emoji: '🟢', color: '#6B8E23', dish: 'Chutney', fact: 'Coriander leaves and seeds are both used as flavouring in cooking.' },
  { id: 'cinnamon', name: 'Cinnamon', emoji: '🟫', color: '#D2691E', dish: 'Cinnamon Toast', fact: 'Cinnamon comes from tree bark and adds a sweet, warm flavour to food.' },
  { id: 'cardamom', name: 'Cardamom', emoji: '💚', color: '#228B22', dish: 'Chai Tea', fact: 'Cardamom is called the "Queen of Spices" and adds fragrance to tea and desserts.' },
  { id: 'pepper', name: 'Black Pepper', emoji: '⚫', color: '#333333', dish: 'Soup', fact: 'Black pepper is called the "King of Spices" and is the most traded spice in the world.' },
  { id: 'chilli', name: 'Red Chilli', emoji: '🌶️', color: '#DC143C', dish: 'Curry', fact: 'Chilli peppers add heat and colour to food and come in many varieties.' },
  { id: 'mustard', name: 'Mustard Seeds', emoji: '🟡', color: '#DAA520', dish: 'Pickles', fact: 'Mustard seeds pop and sizzle when heated in oil, releasing a nutty flavour.' },
];

export const ELECTRICITY_ITEMS = [
  { id: 'light_on', name: 'Empty Room Light', shouldOff: true, emoji: '💡', reason: 'Turn off lights in rooms where nobody is present to save electricity.' },
  { id: 'fan_on', name: 'Fan in Empty Room', shouldOff: true, emoji: '🌀', reason: 'Switch off fans when leaving a room — they cool people, not rooms.' },
  { id: 'tv_on', name: 'TV Nobody Watching', shouldOff: true, emoji: '📺', reason: 'Turn off the TV when nobody is watching to avoid wasting power.' },
  { id: 'charger', name: 'Phone Charger (no phone)', shouldOff: true, emoji: '🔌', reason: 'Unplug chargers when not in use — they still draw a small amount of power.' },
  { id: 'study_light', name: 'Study Lamp (in use)', shouldOff: false, emoji: '🔦', reason: 'This lamp is helping someone study — it should stay on!' },
  { id: 'fridge', name: 'Refrigerator', shouldOff: false, emoji: '🧊', reason: 'The fridge needs to stay on to keep food fresh and safe.' },
  { id: 'night_light', name: 'Hallway Night Light', shouldOff: false, emoji: '🌙', reason: 'A small night light in the hallway helps prevent trips and falls.' },
  { id: 'ac_open', name: 'AC with Open Window', shouldOff: true, emoji: '❄️', reason: 'Close windows when the AC is on, or turn off the AC to save energy.' },
];

export const WATER_SCENARIOS = [
  { id: 'drip', question: 'You see a tap dripping. What do you do?', options: ['Turn it off tightly', 'Leave it dripping', 'Open it more'], correct: 0, fact: 'A dripping tap can waste over 20 litres of water per day!' },
  { id: 'brush', question: 'While brushing teeth, should you keep the water running?', options: ['Turn off while brushing', 'Keep it running', 'Use a hose'], correct: 0, fact: 'Turning off the tap while brushing can save about 6 litres of water each time.' },
  { id: 'bath', question: 'Which uses less water?', options: ['A short shower', 'A full bathtub', 'Same amount'], correct: 0, fact: 'A short shower typically uses 35-40 litres while a full bath can use 150 litres.' },
  { id: 'garden', question: 'When is the best time to water plants?', options: ['Early morning or evening', 'Midday when it is hot', 'Anytime is fine'], correct: 0, fact: 'Watering in the morning or evening reduces evaporation, helping plants get more water.' },
  { id: 'wash', question: 'How should you wash vegetables?', options: ['In a bowl of water', 'Under a running tap for 10 minutes', 'With a pressure washer'], correct: 0, fact: 'Washing in a bowl uses much less water than letting the tap run.' },
  { id: 'leak', question: 'You notice a puddle near a pipe. What should you do?', options: ['Tell an adult about the leak', 'Ignore it', 'Play in the water'], correct: 0, fact: 'Reporting leaks quickly prevents water waste and possible damage.' },
];

export const CLEAN_ITEMS = [
  { id: 'book1', name: 'Storybook', emoji: '📕', target: 'bookshelf', targetName: 'Bookshelf' },
  { id: 'book2', name: 'Textbook', emoji: '📗', target: 'bookshelf', targetName: 'Bookshelf' },
  { id: 'toy1', name: 'Teddy Bear', emoji: '🧸', target: 'toybox', targetName: 'Toy Box' },
  { id: 'toy2', name: 'Building Blocks', emoji: '🧱', target: 'toybox', targetName: 'Toy Box' },
  { id: 'shirt', name: 'Dirty Shirt', emoji: '👕', target: 'laundry', targetName: 'Laundry Basket' },
  { id: 'sock', name: 'Socks', emoji: '🧦', target: 'laundry', targetName: 'Laundry Basket' },
  { id: 'shoe1', name: 'Sneakers', emoji: '👟', target: 'shoerack', targetName: 'Shoe Rack' },
  { id: 'shoe2', name: 'Sandals', emoji: '🩴', target: 'shoerack', targetName: 'Shoe Rack' },
];

export const FOOD_ITEMS = [
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'fruits', group: 'Fruits & Vegetables' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'fruits', group: 'Fruits & Vegetables' },
  { id: 'carrot', name: 'Carrot', emoji: '🥕', category: 'vegetables', group: 'Fruits & Vegetables' },
  { id: 'broccoli', name: 'Broccoli', emoji: '🥦', category: 'vegetables', group: 'Fruits & Vegetables' },
  { id: 'rice', name: 'Rice', emoji: '🍚', category: 'grains', group: 'Grains & Cereals' },
  { id: 'bread', name: 'Bread', emoji: '🍞', category: 'grains', group: 'Grains & Cereals' },
  { id: 'milk', name: 'Milk', emoji: '🥛', category: 'dairy', group: 'Dairy' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'dairy', group: 'Dairy' },
  { id: 'egg', name: 'Egg', emoji: '🥚', category: 'protein', group: 'Protein Foods' },
  { id: 'fish', name: 'Fish', emoji: '🐟', category: 'protein', group: 'Protein Foods' },
  { id: 'candy', name: 'Candy', emoji: '🍬', category: 'treat', group: 'Occasional Treats' },
  { id: 'chips', name: 'Chips', emoji: '🍿', category: 'treat', group: 'Occasional Treats' },
];

export const FOOD_CATEGORIES = [
  { id: 'fruits', name: 'Fruits & Vegetables', color: '#4CAF50', emoji: '🥗' },
  { id: 'grains', name: 'Grains & Cereals', color: '#FF9800', emoji: '🌾' },
  { id: 'dairy', name: 'Dairy', color: '#2196F3', emoji: '🥛' },
  { id: 'protein', name: 'Protein Foods', color: '#E91E63', emoji: '🍗' },
  { id: 'treat', name: 'Occasional Treats', color: '#9C27B0', emoji: '🍬' },
];

export const PLANT_STEPS = [
  { id: 'soil', name: 'Add good soil', emoji: '🪴', description: 'Plants need nutrient-rich soil to grow strong roots.' },
  { id: 'seed', name: 'Plant the seed', emoji: '🌰', description: 'Place the seed gently in the soil at the right depth.' },
  { id: 'water', name: 'Water the plant', emoji: '💧', description: 'Water helps seeds sprout and plants grow. Not too much, not too little!' },
  { id: 'sun', name: 'Give sunlight', emoji: '☀️', description: 'Most plants need sunlight to make their food through photosynthesis.' },
  { id: 'care', name: 'Wait and care', emoji: '🌱', description: 'With patience and daily care, your plant will grow!' },
];

export const COMPOST_ITEMS = [
  { id: 'fruit_peel', name: 'Fruit Peels', emoji: '🍊', compostable: true, reason: 'Fruit peels break down naturally and add nutrients to compost.' },
  { id: 'leaves', name: 'Dry Leaves', emoji: '🍂', compostable: true, reason: 'Dry leaves decompose and add carbon to the compost.' },
  { id: 'tea_leaves', name: 'Tea Leaves', emoji: '🍵', compostable: true, reason: 'Used tea leaves are great for composting.' },
  { id: 'plastic_wrap', name: 'Plastic Wrap', emoji: '🧻', compostable: false, reason: 'Plastic does not decompose and should not go in compost.' },
  { id: 'glass_piece', name: 'Glass Piece', emoji: '🔲', compostable: false, reason: 'Glass is not biodegradable. It should be recycled separately.' },
  { id: 'metal_can', name: 'Metal Can', emoji: '🥫', compostable: false, reason: 'Metal does not decompose. Recycle it instead.' },
  { id: 'eggshell', name: 'Eggshells', emoji: '🥚', compostable: true, reason: 'Eggshells are compostable and add calcium to the soil.' },
  { id: 'veggie_scrap', name: 'Veggie Scraps', emoji: '🥬', compostable: true, reason: 'Vegetable scraps are perfect composting material.' },
];

export const LAUNDRY_ITEMS = [
  { id: 'white_shirt', name: 'White Shirt', emoji: '🤍', color: 'light', clean: true },
  { id: 'blue_jeans', name: 'Blue Jeans', emoji: '👖', color: 'dark', clean: true },
  { id: 'red_dress', name: 'Red Dress', emoji: '👗', color: 'dark', clean: true },
  { id: 'white_socks', name: 'White Socks', emoji: '🧦', color: 'light', clean: false },
  { id: 'black_tshirt', name: 'Black T-Shirt', emoji: '🖤', color: 'dark', clean: false },
  { id: 'yellow_towel', name: 'Yellow Towel', emoji: '💛', color: 'light', clean: false },
  { id: 'green_sweater', name: 'Green Sweater', emoji: '💚', color: 'dark', clean: true },
  { id: 'pink_pjs', name: 'Pink Pyjamas', emoji: '💗', color: 'light', clean: false },
];

export const SAFETY_SCENARIOS = [
  { id: 'wire', question: 'You see an exposed wire on the floor. What should you do?', 
    options: ['Stay away and tell an adult immediately', 'Touch it to see if it is live', 'Cover it with a cloth'],
    correct: 0, explanation: 'Never touch exposed wires. Always tell a trusted adult right away.' },
  { id: 'stove', question: 'The stove is hot after cooking. What is the safe choice?', 
    options: ['Stay away and let it cool down', 'Touch it to check temperature', 'Put your toys on it'],
    correct: 0, explanation: 'Hot surfaces can cause burns. Always let the stove cool down completely.' },
  { id: 'smoke', question: 'You hear the smoke alarm beeping. What should you do?', 
    options: ['Alert your family and go outside calmly', 'Ignore it', 'Hide under the bed'],
    correct: 0, explanation: 'A smoke alarm means there might be danger. Alert your family and leave the house calmly.' },
  { id: 'stranger', question: 'Someone you do not know knocks at the door. What should you do?', 
    options: ['Do not open the door and tell an adult', 'Open the door and invite them in', 'Shout at them'],
    correct: 0, explanation: 'Never open the door to strangers. Always let a trusted adult handle it.' },
  { id: 'medicine', question: 'You find colourful pills on the table. What should you do?', 
    options: ['Leave them alone and tell an adult', 'Try one to see what it tastes like', 'Give them to a friend'],
    correct: 0, explanation: 'Never take medicine on your own. Only take medicine when a trusted adult gives it to you.' },
  { id: 'fire_exit', question: 'In an emergency, what is the best way to leave the house?', 
    options: ['Use the nearest safe exit and stay low', 'Jump from the window', 'Wait and do nothing'],
    correct: 0, explanation: 'Always know where the exits are. Stay low if there is smoke and leave calmly.' },
];

export const SHOPPING_DATA = {
  budget: 100,
  items: [
    { id: 'rice', name: 'Rice (1 kg)', price: 15, emoji: '🍚', needed: true },
    { id: 'milk', name: 'Milk (1 L)', price: 10, emoji: '🥛', needed: true },
    { id: 'bread', name: 'Bread', price: 8, emoji: '🍞', needed: true },
    { id: 'eggs', name: 'Eggs (6 pack)', price: 12, emoji: '🥚', needed: true },
    { id: 'soap', name: 'Hand Soap', price: 6, emoji: '🧼', needed: true },
    { id: 'veggies', name: 'Vegetables', price: 20, emoji: '🥦', needed: true },
    { id: 'candy', name: 'Candy Pack', price: 15, emoji: '🍬', needed: false },
    { id: 'chips', name: 'Chips (Large)', price: 18, emoji: '🍿', needed: false },
    { id: 'toy', name: 'Small Toy', price: 25, emoji: '🧸', needed: false },
    { id: 'juice', name: 'Juice Box', price: 8, emoji: '🧃', needed: false },
  ],
};

export const ROUTINE_STEPS = [
  { id: 'wake', name: 'Wake Up', emoji: '⏰', order: 1 },
  { id: 'stretch', name: 'Stretch', emoji: '🧘', order: 2 },
  { id: 'brush', name: 'Brush Teeth', emoji: '🪥', order: 3 },
  { id: 'wash', name: 'Wash Face', emoji: '🧼', order: 4 },
  { id: 'dress', name: 'Get Dressed', emoji: '👔', order: 5 },
  { id: 'breakfast', name: 'Eat Breakfast', emoji: '🥣', order: 6 },
  { id: 'bag', name: 'Pack School Bag', emoji: '🎒', order: 7 },
  { id: 'ready', name: 'Ready to Go!', emoji: '🚶', order: 8 },
];
