import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Store, ShoppingBasket, Coins, Calculator } from "lucide-react";
import GameHUD from "@/features/hud/components/GameHUD";
import { usePlayer } from "@/features/player/hooks/usePlayer";

const ITEMS = [
  { id: "apple", name: "Apple", price: 3, emoji: "🍎" },
  { id: "bread", name: "Bread", price: 5, emoji: "🍞" },
  { id: "milk", name: "Milk", price: 4, emoji: "🥛" },
  { id: "cheese", name: "Cheese", price: 6, emoji: "🧀" },
];

export default function MarketWorld() {
  const { player, updateSkill, addCoins, earnXP, markWorldCompleted } = usePlayer();
  const navigate = useNavigate();
  const [step, setStep] = useState(player.completedToday?.includes("market") ? "completed" : "waiting");
  
  // Order state
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerPaid, setCustomerPaid] = useState(0);
  const [expectedChange, setExpectedChange] = useState(0);
  const [playerInput, setPlayerInput] = useState("");

  const startCustomer = () => {
    // Generate random cart
    const numItems = 2 + Math.floor(Math.random() * 3);
    const newCart = [];
    let newTotal = 0;
    for (let i = 0; i < numItems; i++) {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      newCart.push(item);
      newTotal += item.price;
    }
    
    const paid = newTotal + Math.floor(Math.random() * 10) + 1; // Pays more than total
    
    setCart(newCart);
    setTotal(newTotal);
    setCustomerPaid(paid);
    setExpectedChange(paid - newTotal);
    setStep("billing");
    setPlayerInput("");
  };

  const checkAnswer = () => {
    const changeGiven = parseInt(playerInput, 10);
    if (changeGiven === expectedChange) {
      updateSkill("entrepreneurial", 10);
      earnXP(15);
      addCoins(total); // Keep the profits!
      setStep("success");
    } else {
      updateSkill("entrepreneurial", -2); // Penalty
      setStep("failed");
    }
  };

  const finish = () => {
    markWorldCompleted("market");
    navigate("/world");
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-b from-purple-50 to-pink-50 p-6">
      <GameHUD objective="Run the village store." />
      
      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center pt-16">
        <AnimatePresence mode="wait">
          {step === "completed" && (
            <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
              <Store className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Store Closed for Today.</h2>
              <p className="text-slate-600 mb-6">You've served enough customers today. Check your profits and get some rest!</p>
              <Link to="/world" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-colors">
                <ArrowLeft className="w-5 h-5"/> Return to Map
              </Link>
            </motion.div>
          )}

          {step === "waiting" && (
            <motion.div key="waiting" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border-4 border-purple-100">
              <Store className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Open for Business</h2>
              <p className="text-slate-600 mb-6">Ready to serve customers and practice your math?</p>
              <button onClick={startCustomer} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold w-full transition-colors shadow-lg shadow-purple-600/30">
                Wait for Customer
              </button>
            </motion.div>
          )}

          {step === "billing" && (
            <motion.div key="billing" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-purple-600 p-6 text-white text-center">
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><ShoppingBasket /> Customer Order</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-lg flex items-center gap-2">{item.emoji} {item.name}</span>
                      <span className="font-bold text-slate-700">{item.price} Coins</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t-2 border-dashed border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500 font-bold">Total Bill:</span>
                    <span className="text-xl font-black text-slate-800">{total} Coins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">Customer Pays:</span>
                    <span className="text-xl font-black text-emerald-600">{customerPaid} Coins</span>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                  <label className="block text-purple-900 font-bold mb-2">How much change should you give?</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={playerInput}
                      onChange={(e) => setPlayerInput(e.target.value)}
                      className="flex-1 bg-white border-2 border-purple-200 rounded-xl px-4 py-3 font-bold text-lg outline-none focus:border-purple-500"
                      placeholder="Enter change amount..."
                      autoFocus
                    />
                  </div>
                </div>

                <button onClick={checkAnswer} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5"/> Give Change
                </button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-emerald-50 rounded-3xl p-8 shadow-2xl border-4 border-emerald-200 text-center">
              <Coins className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">Correct!</h2>
              <p className="text-emerald-700 mb-8">You gave the correct change ({expectedChange} coins). The customer is happy, and you earned {total} coins in profit! Entrepreneurial skill increased.</p>
              <button onClick={finish} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold w-full transition-colors flex justify-center items-center gap-2">
                <ArrowLeft className="w-5 h-5"/> Close Shop & Return to Map
              </button>
            </motion.div>
          )}

          {step === "failed" && (
            <motion.div key="failed" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-rose-50 rounded-3xl p-8 shadow-2xl border-4 border-rose-200 text-center">
              <Calculator className="w-16 h-16 text-rose-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-rose-900 mb-4">Oops!</h2>
              <p className="text-rose-700 mb-8">That's incorrect. The correct change was {expectedChange} coins. The customer left unhappy.</p>
              <button onClick={() => setStep("waiting")} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold w-full transition-colors flex justify-center items-center gap-2">
                Try Another Customer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
