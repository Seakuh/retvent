import { UserLevel } from "../../utils";

export const ProgressBar = ({
  progress,
  userLevel,
}: {
  progress: number;
  userLevel: UserLevel;
}) => {
  return (
    <div className="progress-container">
      <div
        className="progress-bar"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${userLevel.color} 0%, ${userLevel.color}80 100%)`,
        }}
      />
    </div>
  );
};
