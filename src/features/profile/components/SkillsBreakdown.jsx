import { useMemo } from "react";
import { SKILL_DEFINITIONS, SKILL_DISPLAY_MAX } from "@/features/profile/utils/profileData";

/**
 * SkillsBreakdown — displays progress in the 5 foundational skill pillars.
 * All points reflect existing player state: life, human, digital, vocational, entrepreneurial.
 */
export default function SkillsBreakdown({ skills = {} }) {
  const skillList = useMemo(() => {
    return Object.entries(SKILL_DEFINITIONS).map(([key, def]) => {
      const value = skills[key] || 0;
      const pct = Math.min(100, Math.round((value / SKILL_DISPLAY_MAX) * 100));
      return {
        key,
        ...def,
        value,
        pct,
      };
    });
  }, [skills]);

  return (
    <div className="pixel-card profile-fade-in profile-stagger-3" style={{ marginBottom: 28 }}>
      <div className="section-title">
        <span className="section-icon">🧠</span>
        <span>Core Skill Pillars</span>
      </div>

      <div className="skills-grid">
        {skillList.map((skill) => (
          <div
            key={skill.key}
            className="skill-card"
            style={{
              borderColor: `${skill.color}25`,
            }}
          >
            <div className="skill-header">
              <div
                className="skill-icon-wrap"
                style={{
                  background: skill.colorSoft,
                  border: `1px solid ${skill.color}40`,
                }}
              >
                {skill.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="skill-name">{skill.label}</div>
                <div className="skill-value">
                  <span style={{ color: skill.color, fontWeight: 800 }}>{skill.value}</span> / {SKILL_DISPLAY_MAX} pts
                </div>
              </div>
            </div>

            <div className="skill-bar-track">
              <div
                className="skill-bar-fill"
                style={{
                  width: `${skill.pct}%`,
                  background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                }}
              />
            </div>

            <div className="skill-desc">{skill.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
