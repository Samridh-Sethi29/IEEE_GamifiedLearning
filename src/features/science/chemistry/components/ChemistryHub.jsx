import { useState, useEffect } from "react";
import SubjectHub from "../../ui/SubjectHub";
import { CHEMISTRY_TOPICS, getChemistryStats, readProgress } from "../../ui/subjectData";

export default function ChemistryHub() {
  const [progress, setProgress] = useState({});

  // Progress is stored by the lessons/games under "chemistry_progress"; the hub only reads it.
  useEffect(() => {
    setProgress(readProgress("chemistry_progress"));
  }, []);

  return (
    <SubjectHub
      theme="chemistry"
      icon="🧪"
      title="Chemistry"
      subtitle="Explore atoms, matter, reactions, and the colours of acids and bases."
      particles={["🧪", "⚗️", "🧊", "⚛️", "🔥", "💧"]}
      topics={CHEMISTRY_TOPICS}
      isTopicDone={(id) => !!progress[id]}
      isGameDone={(id) => !!progress[`${id}-game`]}
      stats={getChemistryStats(progress)}
      mission={{
        route: "/world/school/science/chemistry/mission",
        title: "Final Chemistry Mission",
        icon: "🔬",
        lockedText: "Complete all topics and games to unlock the final mission.",
        readyText: "Put everything you've learned into action.",
        doneText: "You've proven your understanding of atoms, matter, and reactions.",
      }}
    />
  );
}
