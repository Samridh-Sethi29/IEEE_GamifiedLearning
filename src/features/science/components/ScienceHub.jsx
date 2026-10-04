import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { SciPage, SciBackButton, SciProgress } from "../ui/SciUI";
import { PHYSICS_TOPICS, CHEMISTRY_TOPICS, BIOLOGY_TOPICS, getPhysicsStats, getChemistryStats, getBiologyStats } from "../ui/subjectData";

// Order matches the intro chips: Physics, Chemistry, Biology.
const BRANCHES = [
  { id: "physics", name: "Physics", icon: "⚛️", theme: "physics", topics: PHYSICS_TOPICS, getStats: getPhysicsStats, description: "Discover the laws of motion and energy." },
  { id: "chemistry", name: "Chemistry", icon: "🧪", theme: "chemistry", topics: CHEMISTRY_TOPICS, getStats: getChemistryStats, description: "Mix elements and understand matter." },
  { id: "biology", name: "Biology", icon: "🧬", theme: "biology", topics: BIOLOGY_TOPICS, getStats: getBiologyStats, description: "Explore life and how living things work." },
];

function statusOf(stats) {
  if (stats.percent >= 100 || stats.missionDone) return { label: "Mastered", done: true };
  if (stats.percent > 0) return { label: "In progress" };
  return { label: "New" };
}

export default function ScienceHub() {
  const navigate = useNavigate();
  // Read-only snapshot of the three existing progress records (re-read on mount).
  const [rows, setRows] = useState(() => BRANCHES.map((b) => b.getStats()));
  useEffect(() => setRows(BRANCHES.map((b) => b.getStats())), []);

  const overall = Math.round(rows.reduce((sum, s) => sum + Math.min(100, s.percent), 0) / rows.length);

  return (
    <SciPage theme="science" fit particles={["🔬", "🧪", "⚛️", "🧬", "🔭", "🧲"]}>
      <div className="sv-shell" style={{ "--sv-max": "1040px" }}>
        <div className="sv-topbar">
          <SciBackButton to="/world/school/science">Back to Science</SciBackButton>
        </div>

        <header className="sv-hubhead">
          <h1 className="sv-hubtitle"><span>🔬</span> SCIENCE HUB</h1>
          <p className="sv-hubsub">Select a branch of science to explore.</p>
          <div className="sv-mastery" aria-label={`Overall science progress ${overall}%`}>
            <span>Science Mastery</span>
            <SciProgress percent={overall} />
            <b>{overall}%</b>
          </div>
        </header>

        <div className="sv-branches">
          {BRANCHES.map((branch, i) => {
            const stats = rows[i];
            const status = statusOf(stats);
            const pct = Math.min(100, stats.percent);
            return (
              <motion.button
                key={branch.id}
                type="button"
                onClick={() => navigate(`/world/school/science/${branch.id}`)}
                className={`sv-branch sv-theme-${branch.theme}`}
                style={{ "--i": i }}
                whileTap={{ scale: 0.97 }}
                aria-label={`Enter ${branch.name}, ${pct}% complete`}
              >
                <span className="sv-badge sv-branch__status">
                  {status.done && <Check size={11} strokeWidth={3} />} {status.label}
                </span>
                <div className="sv-branch__icon" aria-hidden="true">{branch.icon}</div>
                <div className="sv-branch__text">
                  <h2 className="sv-branch__name">{branch.name}</h2>
                  <p className="sv-branch__desc">{branch.description}</p>
                </div>
                <div className="sv-branch__tags">
                  {branch.topics.map((t) => <span key={t.id}>{t.icon} {t.short}</span>)}
                </div>
                <div className="sv-branch__meter">
                  <div className="sv-branch__meta">
                    <span>{stats.topicsDone}/{stats.topicsTotal} topics · {stats.gamesDone}/{stats.gamesTotal} games</span>
                    <span>{pct}%</span>
                  </div>
                  <SciProgress percent={pct} onDark />
                </div>
                <span className="sv-btn sv-btn--light sv-btn--block sv-branch__cta">
                  Enter {branch.name} <ArrowRight size={16} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </SciPage>
  );
}
