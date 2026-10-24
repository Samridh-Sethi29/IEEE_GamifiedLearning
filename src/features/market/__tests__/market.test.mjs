import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS, DENOMINATIONS } from "../utils/constants.js";
import {
  generateCustomer,
  generatePaymentAmount,
  calculateChangeSum,
  isChangeExact,
  getChangeHint
} from "../utils/marketLogic.js";

test("PRODUCTS configuration has valid attributes and positive prices", () => {
  const keys = Object.keys(PRODUCTS);
  assert.ok(keys.length >= 9, "Should have at least 9 products across 3 shelves");

  keys.forEach((key) => {
    const prod = PRODUCTS[key];
    assert.ok(prod.id, `Product ${key} must have an id`);
    assert.ok(prod.name, `Product ${key} must have a name`);
    assert.ok(prod.unitPrice > 0, `Product ${key} must have unitPrice > 0`);
    assert.ok(prod.restockCost > 0, `Product ${key} must have restockCost > 0`);
    assert.ok(prod.restockCost <= prod.unitPrice, `Wholesale cost should be <= retail price for profit margin`);
    assert.ok(["drinks", "snacks", "food"].includes(prod.shelf), `Product ${key} shelf must be drinks, snacks, or food`);
  });
});

test("DENOMINATIONS includes all standard Indian notes and coins", () => {
  const values = DENOMINATIONS.map(d => d.value);
  const expected = [500, 200, 100, 50, 20, 10, 5, 2, 1];
  expected.forEach(v => {
    assert.ok(values.includes(v), `Missing denomination ₹${v}`);
  });
});

test("Customer generation creates valid order with correct bill total", () => {
  const inventory = {
    milk: { shelf: 5, storage: 10 },
    chips: { shelf: 5, storage: 10 }
  };
  const customer = generateCustomer(inventory);
  assert.ok(customer.id);
  assert.ok(customer.items.length >= 1);
  assert.ok(customer.billTotal > 0);
  assert.ok(customer.customerPaid >= customer.billTotal);
  assert.equal(customer.changeDue, customer.customerPaid - customer.billTotal);

  // Verify bill calculation formula: Total = sum(line totals) = sum(qty * price)
  let calculatedSum = 0;
  customer.items.forEach(item => {
    assert.equal(item.lineTotal, item.quantity * item.unitPrice);
    calculatedSum += item.lineTotal;
  });
  assert.equal(customer.billTotal, calculatedSum);
});

test("Indian Currency Change calculation: multiple valid combinations equal change due", () => {
  // Scenario: Bill = ₹70, Paid = ₹100, Change Due = ₹30
  const changeDue = 30;

  // Combination 1: ₹20 note + ₹10 note
  const combo1 = [
    { value: 20, count: 1 },
    { value: 10, count: 1 }
  ];
  assert.equal(calculateChangeSum(combo1), 30);
  assert.ok(isChangeExact(combo1, changeDue));

  // Combination 2: 3 x ₹10 note
  const combo2 = [
    { value: 10, count: 3 }
  ];
  assert.equal(calculateChangeSum(combo2), 30);
  assert.ok(isChangeExact(combo2, changeDue));

  // Combination 3: ₹20 note + 2 x ₹5 coin
  const combo3 = [
    { value: 20, count: 1 },
    { value: 5, count: 2 }
  ];
  assert.equal(calculateChangeSum(combo3), 30);
  assert.ok(isChangeExact(combo3, changeDue));

  // Incorrect change checks:
  const underChange = [{ value: 20, count: 1 }]; // ₹20 != ₹30
  assert.equal(isChangeExact(underChange, changeDue), false);

  const overChange = [{ value: 20, count: 2 }]; // ₹40 != ₹30
  assert.equal(isChangeExact(overChange, changeDue), false);
});

test("getChangeHint generates optimal greedy denomination combination", () => {
  const hint37 = getChangeHint(37);
  // Optimal for 37: 20 + 10 + 5 + 2 = 37
  const sum37 = hint37.reduce((acc, h) => acc + h.value * h.count, 0);
  assert.equal(sum37, 37);

  const hint185 = getChangeHint(185);
  // 100 + 50 + 20 + 10 + 5 = 185
  const sum185 = hint185.reduce((acc, h) => acc + h.value * h.count, 0);
  assert.equal(sum185, 185);
});
