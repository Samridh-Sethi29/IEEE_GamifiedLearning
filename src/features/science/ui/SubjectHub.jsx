import { Link } from "react-router-dom";
import { Check, Lock, Play, Gamepad2, BookOpen, ArrowRight, RotateCcw } from "lucide-react";
import { SciPage, SciBackButton, SciProgress, SciRing, Confetti } from "./SciUI";

// One presentation component for the Physics, Chemistry and Biology hubs.
// Each hub keeps its OWN progress logic and just passes the results in:
//   theme      "physics" | "chemistry" | "biology"
//   topics     [{ id, name, icon, tone, desc, route, hasGame, gameName, gameRoute }]
//   isTopicDone(id) / isGameDone(id)
//   stats      { percent, topicsDone, topicsTotal, gamesDone, gamesTotal, unlocked, missionDone, remaining }
//   mission    { route, title, lockedText, readyText, doneText, icon }
export default function SubjectHub({ theme, icon, title, subtitle, particles, topics, isTopicDone, isGameDone, stats, mission }) {
  const nextId = topics.find((t) => !isTopicDone(t.id))?.id;
  const percent = Math.min(100, stats.percent);
  const missionState = stats.missionDone ? "done" : stats.unlocked ? "ready" : "locked";

  return (
    <SciPage theme={theme} particles={particles}>
      {stats.missionDone && <Confetti />}
      <div className="sv-shell">
        <div className="sv-topbar">
          <SciBackButton to="/world/school/science/hub">Science Hub</SciBackButton>
        </div>

        {/* Hero: identity + overall progress */}
        <section className="sv-panel sv-hero" style={{ animation: "sv-rise .5s both" }}>
          <div className="sv-hero__icon" aria-hidden="true">{icon}</div>
          <div className="sv-hero__text">
            <p className="sv-kicker">Science</p>
            <h1 className="sv-title">{title}</h1>
            <p className="sv-sub">{subtitle}</p>
          </div>
          <div className="sv-hero__stats">
            <SciRing percent={percent} />
            <div className="sv-statchips">
              <span className="sv-chip"><span className="sv-chip__dot"><BookOpen size={13} /></span><b>{stats.topicsDone}/{stats.topicsTotal}</b> Topics</span>
              <span className="sv-chip"><span className="sv-chip__dot"><Gamepad2 size={13} /></span><b>{stats.gamesDone}/{stats.gamesTotal}</b> Games</span>
              <span className="sv-chip">
                <span className="sv-chip__dot">{stats.missionDone ? <Check size={13} /> : stats.unlocked ? "🔓" : <Lock size={12} />}</span>
                <b>Final Mission</b>
              </span>
            </div>
          </div>
        </section>

        {/* Topic cards */}
        <div className="sv-grid">
          {topics.map((topic, i) => {
            const topicDone = isTopicDone(topic.id);
            const gameDone = topic.hasGame && isGameDone(topic.id);
            const allDone = topicDone && (!topic.hasGame || gameDone);
            const isNext = topic.id === nextId;
            const badge = allDone
              ? <span className="sv-badge sv-badge--done"><Check size={12} strokeWidth={3} /> Completed</span>
              : isNext
                ? <span className="sv-badge sv-badge--next">Up next</span>
                : topicDone
                  ? <span className="sv-badge">Game ready</span>
                  : <span className="sv-badge sv-badge--muted">Available</span>;

            return (
              <article
                key={topic.id}
                className={`sv-panel sv-topic ${allDone ? "is-done" : ""} ${isNext ? "is-next" : ""}`}
                style={{ "--i": i, "--t1": topic.tone[0], "--t2": topic.tone[1] }}
              >
                <div className="sv-topic__head">
                  <div className="sv-topic__icon" aria-hidden="true">{topic.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <h2 className="sv-topic__name">{topic.name}</h2>
                    <p className="sv-topic__desc">{topic.desc}</p>
                  </div>
                  <div className="sv-topic__badge">{badge}</div>
                </div>

                <div className="sv-steps">
                  <span className={`sv-step ${topicDone ? "sv-step--done" : "sv-step--open"}`}>
                    {topicDone ? <Check size={13} strokeWidth={3} /> : <BookOpen size={13} />} Lesson &amp; Knowledge Check
                  </span>
                  {topic.hasGame && (
                    <span className={`sv-step ${gameDone ? "sv-step--done" : topicDone ? "sv-step--open" : "sv-step--locked"}`}>
                      {gameDone ? <Check size={13} strokeWidth={3} /> : topicDone ? <Gamepad2 size={13} /> : <Lock size={12} />} {topic.gameName}
                    </span>
                  )}
                </div>

                <div className="sv-actions">
                  <Link to={topic.route} className={`sv-btn ${topicDone ? "" : "sv-btn--primary"}`}>
                    {topicDone ? <RotateCcw size={15} /> : <Play size={15} fill="currentColor" />}
                    {topicDone ? "Review Topic" : "Explore"}
                  </Link>
                  {topic.hasGame && (topicDone ? (
                    <Link to={topic.gameRoute} className={`sv-btn ${gameDone ? "sv-btn--done" : "sv-btn--gold"}`}>
                      🎮 {gameDone ? "Play Again" : `Play ${topic.gameName}`}
                    </Link>
                  ) : (
                    <button type="button" disabled aria-disabled="true" className="sv-btn sv-btn--locked" title="Finish the lesson to unlock this game">
                      <Lock size={14} /> Game locked
                    </button>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        {/* Final mission */}
        <section className={`sv-mission sv-mission--${missionState}`}>
          <div className="sv-mission__trophy" aria-hidden="true">{missionState === "locked" ? "🔒" : mission.icon}</div>
          <div className="sv-mission__body">
            <h2 className="sv-mission__title">{mission.title}</h2>
            <p className="sv-mission__text">
              {missionState === "done" ? mission.doneText : missionState === "ready" ? mission.readyText : mission.lockedText}
            </p>
            {missionState === "locked" && (
              <div className="sv-mission__meter">
                <SciProgress percent={percent} />
                <p className="sv-mission__text" style={{ fontSize: 13, marginTop: 6 }}>
                  {stats.remaining} more {stats.remaining === 1 ? "step" : "steps"} to unlock
                </p>
              </div>
            )}
          </div>
          <div className="sv-mission__cta">
            {missionState === "locked" ? (
              <button type="button" disabled aria-disabled="true" className="sv-btn sv-btn--lg sv-btn--locked"><Lock size={16} /> Locked</button>
            ) : (
              <Link to={mission.route} className="sv-btn sv-btn--lg sv-btn--light">
                {missionState === "done" ? "Replay Mission" : "Start Final Mission"} <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>
      </div>
    </SciPage>
  );
}
