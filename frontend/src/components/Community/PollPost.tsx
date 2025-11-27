import { useState } from "react";
import "./PollPost.css";

interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

interface PollPostProps {
  pollId: string;
  question: string;
  options: PollOption[];
  userId?: string;
  onVote: (optionId: string) => void;
}

export const PollPost: React.FC<PollPostProps> = ({
  pollId,
  question,
  options,
  userId,
  onVote,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const totalVotes = options.reduce((sum, opt) => sum + opt.votes.length, 0);
  const hasVoted = options.some((opt) => opt.votes.includes(userId || ""));

  const handleVote = (optionId: string) => {
    if (hasVoted || !userId) return;
    setSelectedOption(optionId);
    onVote(optionId);
  };

  return (
    <div className="poll-post">
      <h4 className="poll-question">{question}</h4>
      <div className="poll-options">
        {options.map((option) => {
          const percentage =
            totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
          const isSelected = option.id === selectedOption;
          const userVoted = option.votes.includes(userId || "");

          return (
            <button
              key={option.id}
              className={`poll-option ${hasVoted ? "voted" : ""} ${
                userVoted ? "user-voted" : ""
              }`}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted || !userId}
            >
              <div className="poll-option-content">
                <span className="poll-option-text">{option.text}</span>
                {hasVoted && (
                  <span className="poll-option-percentage">
                    {percentage.toFixed(0)}%
                  </span>
                )}
              </div>
              {hasVoted && (
                <div
                  className="poll-option-bar"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="poll-total-votes">{totalVotes} votes</div>
    </div>
  );
};
