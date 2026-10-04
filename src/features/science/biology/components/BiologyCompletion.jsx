import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { usePlayer } from "@/features/player/hooks/usePlayer";
import { Confetti } from "../../ui/SciUI";

export default function BiologyCompletion() {
  const navigate = useNavigate();
  const { earnXP } = usePlayer();
  const [xpAwarded, setXpAwarded] = useState(false);

  useEffect(() => {
    if (!xpAwarded) {
      earnXP(500);
      setXpAwarded(true);
    }
  }, [earnXP, xpAwarded]);

  return (
    <div className="sv-center">
      <Confetti count={90} duration={6000} />
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.45, duration: 0.9 }}
        className="sv-panel sv-trophy"
      >
        <motion.div
          initial={{ y: -40, scale: 0, rotate: -20 }}
          animate={{ y: 0, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
          className="sv-trophy__icon"
        >
          🧬
        </motion.div>
        <h1 className="sv-trophy__title">Biology Master</h1>
        <div className="sv-badge sv-badge--gold sv-trophy__xp">⭐ 500 XP</div>

        <ul className="sv-trophy__list">
          {["The Cell", "Human Body", "Plants", "Ecosystem"].map((item, i) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.2 }}
            >
              <CheckCircle2 size={24} strokeWidth={2.6} />
              {item}
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
          className="sv-trophy__badge"
        >
          <span>🏅</span> Biology Explorer
        </motion.div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.1 }}
          onClick={() => navigate("/world/school/science/hub")}
          className="sv-btn sv-btn--primary sv-btn--lg sv-btn--block"
        >
          Continue to Science
        </motion.button>
      </motion.div>
    </div>
  );
}
