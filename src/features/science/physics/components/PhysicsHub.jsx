import { useState, useEffect } from "react";
import SubjectHub from "../../ui/SubjectHub";
import { PHYSICS_TOPICS, getPhysicsStats, readProgress } from "../../ui/subjectData";

export default function PhysicsHub() {
  const [progress, setProgress] = useState({});

  // Progress is stored by the lessons/games under "physics_progress"; the hub only reads it.
  useEffect(() => {
    setProgress(readProgress("physics_progress"));
  }, []);

  return (
    <SubjectHub
      theme="physics"
      icon="⚛️"
      title="Physics"
      subtitle="Understand how the world moves, works, shines, and sounds."
      particles={["⚡", "💡", "🔊", "🏃", "🧲", "🔭"]}
      topics={PHYSICS_TOPICS}
      isTopicDone={(id) => !!progress[id]}
      isGameDone={(id) => !!progress[`${id}-game`]}
      stats={getPhysicsStats(progress)}
      mission={{
        route: "/world/school/science/physics/mission",
        title: "Final Physics Mission",
        icon: "🏆",
        lockedText: "Complete all topics and games to unlock the final challenge.",
        readyText: "Put everything you've learned into action.",
        doneText: "You explored motion, energy, light, and sound. You are a Physics Master!",
      }}
    />
  );
}
