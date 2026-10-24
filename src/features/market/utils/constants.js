// Product definitions, Indian currency denominations, customer profiles, and initial state

export const PRODUCTS = {
  // Shelf 1: DRINKS
  water: {
    id: "water",
    name: "Water Bottle",
    category: "Drinks",
    shelf: "drinks",
    row: "top",
    unitPrice: 15,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 12,
    restockCost: 10,
    color: "#38bdf8",
    accentColor: "#0284c7",
    label: "WATER",
    emoji: "💧"
  },
  juice: {
    id: "juice",
    name: "Orange Juice",
    category: "Drinks",
    shelf: "drinks",
    row: "top",
    unitPrice: 25,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 10,
    restockCost: 16,
    color: "#fb923c",
    accentColor: "#ea580c",
    label: "JUICE",
    emoji: "🧃"
  },
  milk: {
    id: "milk",
    name: "Milk Carton",
    category: "Drinks",
    shelf: "drinks",
    row: "bottom",
    unitPrice: 20,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 12,
    restockCost: 14,
    color: "#38bdf8",
    accentColor: "#0284c7",
    label: "MILK",
    emoji: "🥛"
  },
  soda: {
    id: "soda",
    name: "Cola Can",
    category: "Drinks",
    shelf: "drinks",
    row: "bottom",
    unitPrice: 20,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 12,
    restockCost: 13,
    color: "#ef4444",
    accentColor: "#b91c1c",
    label: "COLA",
    emoji: "🥤"
  },

  // Shelf 2: SNACKS
  chips: {
    id: "chips",
    name: "Potato Chips",
    category: "Snacks",
    shelf: "snacks",
    row: "top",
    unitPrice: 20,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 14,
    restockCost: 12,
    color: "#ef4444",
    accentColor: "#b91c1c",
    label: "CHIPS",
    emoji: "🍟"
  },
  cookies: {
    id: "cookies",
    name: "Choco Cookies",
    category: "Snacks",
    shelf: "snacks",
    row: "bottom",
    unitPrice: 25,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 10,
    restockCost: 15,
    color: "#854d0e",
    accentColor: "#713f12",
    label: "COOKIES",
    emoji: "🍪"
  },
  nuts: {
    id: "nuts",
    name: "Roasted Nuts",
    category: "Snacks",
    shelf: "snacks",
    row: "bottom",
    unitPrice: 30,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 8,
    restockCost: 20,
    color: "#f59e0b",
    accentColor: "#b45309",
    label: "NUTS",
    emoji: "🥜"
  },

  // Shelf 3: FOOD
  apples: {
    id: "apples",
    name: "Red Apples",
    category: "Food",
    shelf: "food",
    row: "top",
    unitPrice: 30,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 10,
    restockCost: 18,
    color: "#dc2626",
    accentColor: "#991b1b",
    label: "APPLES",
    emoji: "🍎"
  },
  bananas: {
    id: "bananas",
    name: "Fresh Bananas",
    category: "Food",
    shelf: "food",
    row: "top",
    unitPrice: 20,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 10,
    restockCost: 12,
    color: "#facc15",
    accentColor: "#ca8a04",
    label: "BANANAS",
    emoji: "🍌"
  },
  oranges: {
    id: "oranges",
    name: "Sweet Oranges",
    category: "Food",
    shelf: "food",
    row: "top",
    unitPrice: 25,
    maxShelf: 10,
    initialShelf: 6,
    initialStorage: 10,
    restockCost: 15,
    color: "#f97316",
    accentColor: "#c2410c",
    label: "ORANGES",
    emoji: "🍊"
  },
  bread: {
    id: "bread",
    name: "Fresh Bread",
    category: "Food",
    shelf: "food",
    row: "bottom",
    unitPrice: 25,
    maxShelf: 10,
    initialShelf: 5,
    initialStorage: 8,
    restockCost: 16,
    color: "#fcd34d",
    accentColor: "#b45309",
    label: "BREAD",
    emoji: "🍞"
  },
  eggs: {
    id: "eggs",
    name: "Farm Eggs",
    category: "Food",
    shelf: "food",
    row: "bottom",
    unitPrice: 35,
    maxShelf: 10,
    initialShelf: 5,
    initialStorage: 8,
    restockCost: 22,
    color: "#e2e8f0",
    accentColor: "#64748b",
    label: "EGGS",
    emoji: "🥚"
  },
  cheese: {
    id: "cheese",
    name: "Swiss Cheese",
    category: "Food",
    shelf: "food",
    row: "bottom",
    unitPrice: 40,
    maxShelf: 10,
    initialShelf: 5,
    initialStorage: 6,
    restockCost: 25,
    color: "#fbbf24",
    accentColor: "#d97706",
    label: "CHEESE",
    emoji: "🧀"
  }
};

export const DENOMINATIONS = [
  { value: 500, label: "₹500", type: "note", bg: "#78716c", border: "#57534e", text: "#ffffff", name: "₹500 Note" },
  { value: 200, label: "₹200", type: "note", bg: "#f97316", border: "#c2410c", text: "#ffffff", name: "₹200 Note" },
  { value: 100, label: "₹100", type: "note", bg: "#a855f7", border: "#7e22ce", text: "#ffffff", name: "₹100 Note" },
  { value: 50,  label: "₹50",  type: "note", bg: "#06b6d4", border: "#0e7490", text: "#ffffff", name: "₹50 Note" },
  { value: 20,  label: "₹20",  type: "note", bg: "#84cc16", border: "#4d7c0f", text: "#ffffff", name: "₹20 Note" },
  { value: 10,  label: "₹10",  type: "note", bg: "#b45309", border: "#78350f", text: "#ffffff", name: "₹10 Note" },
  { value: 10,  label: "₹10",  type: "coin", bg: "#eab308", border: "#94a3b8", text: "#1e293b", name: "₹10 Coin", bimetallic: true },
  { value: 5,   label: "₹5",   type: "coin", bg: "#eab308", border: "#a16207", text: "#713f12", name: "₹5 Coin" },
  { value: 2,   label: "₹2",   type: "coin", bg: "#cbd5e1", border: "#64748b", text: "#1e293b", name: "₹2 Coin" },
  { value: 1,   label: "₹1",   type: "coin", bg: "#e2e8f0", border: "#94a3b8", text: "#334155", name: "₹1 Coin" }
];

export const CUSTOMER_PROFILES = [
  {
    id: "c1",
    name: "Ananya",
    hairColor: "#3e2723",
    hairStyle: "buns",
    skinColor: "#f3c59a",
    shirtColor: "#f472b6",
    pantsColor: "#3b82f6"
  },
  {
    id: "c2",
    name: "Aarav",
    hairColor: "#212121",
    hairStyle: "short",
    skinColor: "#deb887",
    shirtColor: "#eab308",
    pantsColor: "#2563eb"
  },
  {
    id: "c3",
    name: "Diya",
    hairColor: "#4e342e",
    hairStyle: "bob",
    skinColor: "#ffdbac",
    shirtColor: "#14b8a6",
    pantsColor: "#166534"
  },
  {
    id: "c4",
    name: "Vihaan",
    hairColor: "#1c1917",
    hairStyle: "spiky",
    skinColor: "#e0ac69",
    shirtColor: "#8b5cf6",
    pantsColor: "#374151"
  },
  {
    id: "c5",
    name: "Priya",
    hairColor: "#3f2314",
    hairStyle: "ponytail",
    skinColor: "#f1c27d",
    shirtColor: "#ec4899",
    pantsColor: "#4338ca"
  }
];

export const DEFAULT_GOALS = [
  { id: "serve_customers", title: "Serve today's customers", target: 3, current: 0, completed: false, xpReward: 60, coinReward: 50 }
];
