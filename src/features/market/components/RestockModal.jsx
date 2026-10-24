import React, { useState } from "react";
import { X, Check, Plus, Minus, ArrowRight, AlertCircle, Package } from "lucide-react";
import { PRODUCTS } from "../utils/constants";
import "../market-ui.css";

export default function RestockModal({
  isOpen,
  onClose,
  targetShelfKey,
  inventory,
  onRestockItem,
  marketAudio
}) {
  const [selectedProductKey, setSelectedProductKey] = useState("milk");
  const [restockQty, setRestockQty] = useState(2);
  const [feedback, setFeedback] = useState("");
  const [errorFeedback, setErrorFeedback] = useState("");

  if (!isOpen) return null;

  const productKeys = Object.keys(PRODUCTS);
  const selectedProd = PRODUCTS[selectedProductKey] || PRODUCTS.milk;
  const currentShelf = inventory?.[selectedProductKey]?.shelf ?? selectedProd.initialShelf;
  const currentStorage = inventory?.[selectedProductKey]?.storage ?? selectedProd.initialStorage;
  const maxShelf = selectedProd.maxShelf || 10;
  const canAddMore = maxShelf - currentShelf;

  const handleIncrement = () => {
    setErrorFeedback("");
    if (restockQty < Math.min(currentStorage, canAddMore)) {
      setRestockQty((q) => q + 1);
      marketAudio?.playClick();
    }
  };

  const handleDecrement = () => {
    setErrorFeedback("");
    if (restockQty > 1) {
      setRestockQty((q) => q - 1);
      marketAudio?.playClick();
    }
  };

  const handleConfirmRestock = () => {
    setErrorFeedback("");

    if (currentStorage <= 0) {
      marketAudio?.playError();
      setErrorFeedback(`Not enough ${selectedProd.name} in storage!`);
      return;
    }

    if (currentShelf >= maxShelf) {
      marketAudio?.playError();
      setErrorFeedback(`This shelf is full! (Capacity: ${maxShelf})`);
      return;
    }

    const qtyToTransfer = Math.min(restockQty, currentStorage, canAddMore);
    if (qtyToTransfer <= 0) {
      setErrorFeedback("Cannot restock 0 items.");
      return;
    }

    onRestockItem(selectedProductKey, qtyToTransfer);
    marketAudio?.playPick();
    setFeedback(`Restocked +${qtyToTransfer} ${selectedProd.name} to shelf!`);
    setRestockQty(1);

    setTimeout(() => {
      setFeedback("");
    }, 2200);
  };

  const canRestock = currentStorage > 0 && canAddMore > 0;
  const maxQty = Math.min(currentStorage, canAddMore);

  return (
    <div className="sv-root sv-overlay" onClick={onClose}>
      <div className="sv-card sv-stock" onClick={(e) => e.stopPropagation()}>
        <div className="sv-stock-head">
          <div className="sv-stock-title">
            <span className="sv-stock-ico"><Package /></span>
            <div>
              <h3>Stockroom Inventory</h3>
              <p>Move stock from storage onto the shelves</p>
            </div>
          </div>
          <button onClick={onClose} className="sv-close" title="Close" aria-label="Close">
            <X />
          </button>
        </div>

        <div className="sv-scroll">
          {feedback && (
            <div className="sv-toast ok"><Check /><span>{feedback}</span></div>
          )}
          {errorFeedback && (
            <div className="sv-toast bad"><AlertCircle /><span>{errorFeedback}</span></div>
          )}

          <div>
            <div className="sv-label">Select item to restock</div>
            <div className="sv-grid">
              {productKeys.map((k) => {
                const prod = PRODUCTS[k];
                const sQty = inventory?.[k]?.shelf ?? prod.initialShelf;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      setSelectedProductKey(k);
                      setRestockQty(1);
                      setErrorFeedback("");
                    }}
                    className={`sv-pick ${selectedProductKey === k ? "on" : ""}`}
                  >
                    <span className="e">{prod.emoji}</span>
                    <span className="n">{prod.label}</span>
                    <span className={`q ${sQty <= 2 ? "low" : ""}`}>{sQty}/{prod.maxShelf || 10}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sv-detail">
            <div className="sv-detail-top">
              <div className="sv-detail-id">
                <span className="sv-emoji">{selectedProd.emoji}</span>
                <div>
                  <h4>{selectedProd.name}</h4>
                  <p>Category: <b>{selectedProd.category}</b></p>
                </div>
              </div>
              <div className="sv-cap">
                <small>Capacity</small>
                <b>{maxShelf} units</b>
              </div>
            </div>

            <div className="sv-stats">
              <div className="sv-stat">
                <small>On Shelf</small>
                <b className={currentShelf <= 2 ? "warn" : "good"}>{currentShelf} / {maxShelf}</b>
              </div>
              <div className="sv-stat">
                <small>In Storage</small>
                <b className={currentStorage <= 2 ? "amber" : "blue"}>{currentStorage} units</b>
              </div>
            </div>

            <div className="sv-qtyrow">
              <span>Quantity to restock</span>
              <div className="sv-stepper">
                <button className="sv-step" onClick={handleDecrement} disabled={restockQty <= 1} aria-label="Decrease">
                  <Minus />
                </button>
                <output>{restockQty}</output>
                <button className="sv-step" onClick={handleIncrement} disabled={restockQty >= maxQty} aria-label="Increase">
                  <Plus />
                </button>
              </div>
            </div>

            <button className="sv-confirm" onClick={handleConfirmRestock} disabled={!canRestock}>
              <ArrowRight />
              <span>
                {currentShelf >= maxShelf
                  ? "Shelf Already Full"
                  : currentStorage <= 0
                    ? "Nothing in Storage"
                    : `Restock ${restockQty} to Shelf`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
