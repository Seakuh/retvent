import {
  calculateProgress,
  calculateUserLevel,
  USER_LEVELS,
} from "../../utils";
import { ProgressBar } from "./ProgressBar";
export const LevelSection = ({ points }: { points: number }) => {
  // Abgeleitete Werte
  const userLevel = calculateUserLevel(points || 0);
  const progress = calculateProgress(points || 0, userLevel);
  const nextLevel = USER_LEVELS.find((level) => level.level > userLevel.level);

  return (
    <div
      className="level-section"
      style={{
        background: `linear-gradient(135deg, ${userLevel.color}20 0%, ${userLevel.color}40 100%)`,
      }}
    >
      <div className="level-header">
        <div>
          <div className="level-title">Level {userLevel.level}</div>
          <div className="level-name">{userLevel.name}</div>
          <div className="level-description">{userLevel.description}</div>
        </div>
        <div className="points-info">
          <span>{points || 0} Points</span>
          {nextLevel && <span>Next Level: {nextLevel.minPoints}</span>}
        </div>
      </div>

      <ProgressBar progress={progress} userLevel={userLevel} />

      {nextLevel && (
        <div className="next-level">
          <span>Next Level: {nextLevel.name}</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
};
