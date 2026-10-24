import { PRODUCTS, CUSTOMER_PROFILES, DENOMINATIONS } from "./constants.js";

// Generate a random customer with order from available products
export function generateCustomer(inventory, existingCustomerIds = [], difficulty = "beginner") {
  const availableProfile = CUSTOMER_PROFILES.find(p => !existingCustomerIds.includes(p.id)) ||
    CUSTOMER_PROFILES[Math.floor(Math.random() * CUSTOMER_PROFILES.length)];

  // Choose 1 to 2 items for beginner, up to 3 for advanced
  const maxItems = difficulty === "advanced" ? 3 : difficulty === "intermediate" ? 2 : 2;
  const numItems = Math.floor(Math.random() * maxItems) + 1;

  // Filter products that have at least 1 in shelf
  const availableKeys = Object.keys(PRODUCTS).filter(key => (inventory[key]?.shelf || 0) > 0);
  const candidateKeys = availableKeys.length > 0 ? availableKeys : Object.keys(PRODUCTS);

  // Pick items
  const items = [];
  const pickedKeys = new Set();

  for (let i = 0; i < numItems; i++) {
    const unpicked = candidateKeys.filter(k => !pickedKeys.has(k));
    const key = unpicked.length > 0 
      ? unpicked[Math.floor(Math.random() * unpicked.length)]
      : candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
    
    pickedKeys.add(key);
    const product = PRODUCTS[key];
    const availableQty = inventory[key]?.shelf || 1;
    // Quantity 1 or 2
    const qty = Math.min(availableQty, Math.random() > 0.65 ? 2 : 1);
    
    items.push({
      productId: key,
      name: product.name,
      label: product.label,
      emoji: product.emoji,
      unitPrice: product.unitPrice,
      quantity: qty,
      lineTotal: qty * product.unitPrice,
      shelf: product.shelf
    });
  }

  // Calculate total
  const billTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  // Determine realistic payment
  const payment = generatePaymentAmount(billTotal, difficulty);
  const changeDue = payment - billTotal;

  return {
    id: "cust_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    profile: availableProfile,
    items,
    billTotal,
    customerPaid: payment,
    changeDue,
    state: "ENTERING", // ENTERING -> QUEUING -> SHOPPING -> WAITING_CHECKOUT -> BEING_SERVED -> LEAVING
    basket: [],
    currentShelfIndex: 0,
    progress: 0,
    patience: 100, // 100%
    createdAt: Date.now()
  };
}

// Generate realistic Indian currency payment
export function generatePaymentAmount(billTotal, difficulty = "beginner") {
  if (billTotal <= 0) return 0;

  // Standard Indian denominations
  const singleNotes = [10, 20, 50, 100, 200, 500];

  // If exact change sometimes
  if (Math.random() < 0.15 && singleNotes.includes(billTotal)) {
    return billTotal;
  }

  // Pick a single note that covers the bill
  const validNotes = singleNotes.filter(n => n >= billTotal);
  if (validNotes.length > 0) {
    // Beginner prefers nearest note
    if (difficulty === "beginner") {
      return validNotes[0];
    }
    // Intermediate/advanced might pay with higher note or round amount
    const choice = Math.random();
    if (choice < 0.65 || validNotes.length === 1) {
      return validNotes[0];
    } else {
      return validNotes[1] || validNotes[0];
    }
  }

  // If bill > 500
  const nextHundred = Math.ceil(billTotal / 100) * 100;
  return nextHundred;
}

// Calculate sum of selected denominations
export function calculateChangeSum(selectedDenominations) {
  return selectedDenominations.reduce((sum, item) => sum + (item.value * item.count), 0);
}

// Check if change is correct
export function isChangeExact(selectedDenominations, changeDue) {
  return calculateChangeSum(selectedDenominations) === changeDue;
}

// Generate a hint for valid change combination
export function getChangeHint(changeDue) {
  if (changeDue <= 0) return [];
  let remaining = changeDue;
  const result = [];
  const sortedDenoms = [...DENOMINATIONS].sort((a, b) => b.value - a.value);

  for (const denom of sortedDenoms) {
    if (remaining >= denom.value) {
      const count = Math.floor(remaining / denom.value);
      result.push({ ...denom, count });
      remaining -= count * denom.value;
    }
  }
  return result;
}
