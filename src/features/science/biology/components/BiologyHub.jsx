import { useState, useEffect } from "react";
import SubjectHub from "../../ui/SubjectHub";
import { BIOLOGY_TOPICS, getBiologyStats, readProgress } from "../../ui/subjectData";

export default function BiologyHub() {
  const [progress, setProgress] = useState({});

  // Progress is stored by the lessons/games under "biology_progress"; the hub only reads it.
  useEffect(() => {
    setProgress(readProgress("biology_progress"));
  }, []);

  return (
    <SubjectHub
      theme="biology"
      icon="🧬"
      title="Biology"
      subtitle="Explore life and learn how living things work through discoveries, challenges, and play."
      particles={["🧬", "🌱", "🦋", "🫀", "🍃", "🔬"]}
      topics={BIOLOGY_TOPICS}
      isTopicDone={(id) => !!progress[id]}
      isGameDone={(id) => !!progress[`${id}-game`]}
      stats={getBiologyStats(progress)}
      mission={{
        route: "/world/school/science/biology/mission",
        title: "Biology Mission",
        icon: "🔬",
        lockedText: "Complete all lessons and games to unlock the final assessment.",
        readyText: "You've completed all lessons and games. It's time for the final assessment to earn your Biology Master badge!",
        doneText: "You've completed every lesson, game, and the final assessment.",
      }}
    />
  );
}
