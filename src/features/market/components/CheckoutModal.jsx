import React, { useState, useMemo } from "react";
import { X, Check, RotateCcw, AlertCircle, CheckCircle2, ShoppingBag, Receipt, Sparkles } from "lucide-react";
import { DENOMINATIONS } from "../utils/constants";
import "../market-ui.css";

export default function CheckoutModal({
  isOpen,
  onClose,
  customer,
  onProcessPayment,
  marketAudio
}) {
  const [selectedChange, setSelectedChange] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validCustomer = customer || {
    profile: { name: "Ananya", avatar: "girl1" },
    items: [{ productId: "orange", name: "Sweet Oranges", quantity: 1, price: 25, lineTotal: 25, emoji: "🍊" }],
    billTotal: 25,
    customerPaid: 50,
    changeDue: 25
  };

  // Selected change sum
  const changeGiven = useMemo(() => {
    return selectedChange.reduce((sum, item) => sum + item.value, 0);
  }, [selectedChange]);

  const billTotal = validCustomer.billTotal ?? 25;
  const customerPaid = validCustomer.customerPaid ?? 50;
  const changeDue = validCustomer.changeDue ?? 25;
  const difference = changeDue - changeGiven;
  const isExact = changeGiven === changeDue;

  if (!isOpen) return null;

  // Add denomination to change tray
  const handleAddDenomination = (denom) => {
    setErrorMsg("");
    try { marketAudio?.playCoin(); } catch (e) {}
    setSelectedChange((prev) => [
      ...prev,
      {
        value: denom.value,
        label: denom.label,
        type: denom.type,
        name: denom.name,
        bg: denom.bg,
        border: denom.border,
        text: denom.text,
        bimetallic: denom.bimetallic,
        id: "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)
      }
    ]);
  };

  // Remove denomination from change tray
  const handleRemoveDenomination = (id) => {
    setErrorMsg("");
    try { marketAudio?.playCoin(); } catch (e) {}
    setSelectedChange((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all selected change
  const handleClear = () => {
    setErrorMsg("");
    setSelectedChange([]);
  };

  // Confirm payment transaction
  const handleConfirm = () => {
    if (isSubmitting) return;

    if (!isExact) {
      try { marketAudio?.playError(); } catch (e) {}
      if (changeGiven < changeDue) {
        setErrorMsg(`Almost there! Need ₹${difference} more.`);
      } else {
        setErrorMsg(`Selected ₹${Math.abs(difference)} too much. Tap a note or coin in the tray to remove it.`);
      }
      return;
    }

    setIsSubmitting(true);
    try { marketAudio?.playChaChing(); } catch (e) {}
    setSuccessMsg(`Awesome! Bill was ₹${billTotal}, Customer paid ₹${customerPaid}, and you returned ₹${changeDue}!`);

    setTimeout(() => {
      onProcessPayment(validCustomer, changeGiven);
      setSuccessMsg("");
      setSelectedChange([]);
      setIsSubmitting(false);
      onClose();
    }, 1100);
  };

  // Filter denominations into notes and coins
  const notes = DENOMINATIONS.filter((d) => d.type === "note");
  const coins = DENOMINATIONS.filter((d) => d.type === "coin");

  const name = validCustomer.profile?.name || "Customer";

  return (
    <div className="sv-root sv-overlay" onClick={onClose}>
      <div className="sv-card sv-co" onClick={(e) => e.stopPropagation()}>
        <div className="sv-co-head">
          <div className="sv-co-title">
            <span className="ico"><Receipt /></span>
            <div>
              <h3>Checkout Counter</h3>
              <p>Register #1 · give the right change</p>
            </div>
          </div>
          <div className="sv-co-right">
            <span className="sv-cust"><span>👧</span><span>{name}</span></span>
            <button onClick={onClose} className="sv-close" title="Close Counter" aria-label="Close"><X /></button>
          </div>
        </div>

        {successMsg ? (
          <div className="sv-done">
            <CheckCircle2 />
            <h3>Payment Complete!</h3>
            <p>{successMsg}</p>
          </div>
        ) : (
          <div className="sv-co-body">
            <div className="sv-co-stats">
              <div className="sv-co-stat"><small>Total Bill</small><b>₹{billTotal}</b></div>
              <div className="sv-co-stat paid"><small>Customer Paid</small><b>₹{customerPaid}</b></div>
              <div className="sv-co-stat due"><small>Change Due</small><b>₹{changeDue}</b></div>
            </div>

            <div className="sv-items">
              <span className="lb"><ShoppingBag />Items</span>
              {validCustomer.items?.map((item, idx) => (
                <span key={idx} className="sv-item">
                  <span>{item.emoji || "📦"}</span>
                  <span>{item.name}</span>
                  <i>×{item.quantity}</i>
                  <b>₹{item.lineTotal}</b>
                </span>
              ))}
            </div>

            <div className="sv-tray">
              <div className="sv-tray-top">
                <div>
                  <span>Return to Customer</span>
                  <span className="sv-target">Target: ₹{changeDue}</span>
                </div>
                <div>
                  <span className="sv-sel">Selected: <b className={isExact ? "ok" : ""}>₹{changeGiven}</b></span>
                  {selectedChange.length > 0 && (
                    <button onClick={handleClear} className="sv-clear"><RotateCcw />Clear</button>
                  )}
                </div>
              </div>

              <div className="sv-drop">
                {selectedChange.length === 0 ? (
                  <span className="empty">
                    {changeDue === 0 ? "No change needed for this customer" : "Tap the notes and coins below to add change"}
                  </span>
                ) : (
                  selectedChange.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleRemoveDenomination(item.id)}
                      title="Tap to remove"
                      style={{ backgroundColor: item.bg, borderColor: item.border, color: item.text }}
                      className={`sv-given ${item.type}`}
                    >
                      <span>{item.label}</span><X />
                    </button>
                  ))
                )}
              </div>

              {errorMsg ? (
                <div className="sv-hint bad"><AlertCircle /><span>{errorMsg}</span></div>
              ) : isExact ? (
                <div className="sv-hint ok"><CheckCircle2 /><span>Exact change ready! Tap Complete Sale below.</span></div>
              ) : (
                <div className="sv-hint">
                  {difference > 0 ? `Need ₹${difference} more to reach ₹${changeDue}.` : `Over by ₹${Math.abs(difference)}.`}
                </div>
              )}
            </div>

            <div>
              <div className="sv-label">Indian banknotes · tap to give</div>
              <div className="sv-cash-grid notes">
                {notes.map((d, i) => (
                  <button key={i} onClick={() => handleAddDenomination(d)} title={`Add ${d.name}`}
                    style={{ backgroundColor: d.bg, borderColor: d.border, color: d.text }} className="sv-cash note">
                    <b>{d.label}</b><small>NOTE</small>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="sv-label">Coins · tap to give</div>
              <div className="sv-cash-grid coins">
                {coins.map((d, i) => (
                  <button key={i} onClick={() => handleAddDenomination(d)} title={`Add ${d.name}`}
                    style={{ backgroundColor: d.bg, borderColor: d.border, color: d.text }} className="sv-cash coin">
                    <b>{d.label}</b><small>COIN</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="sv-co-actions">
              <button onClick={onClose} className="sv-cancel">Cancel</button>
              <button onClick={handleConfirm} disabled={!isExact || isSubmitting} className="sv-confirm">
                <Check />
                <span>{changeDue > 0 ? `Complete Sale (Return ₹${changeDue})` : "Complete Sale"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}