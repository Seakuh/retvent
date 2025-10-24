import { ReactNode } from "react";
import { Member, Poll, Role } from "../../types/community.types";
import styles from "./PollCard.module.css";

interface PollCardProps {
  poll: Poll;
  author?: Member;
  commentCount: number;
  optimistic?: boolean;
  isExpanded: boolean;
  isVoting: boolean;
  currentUser?: Member | null;
  onToggle: () => void;
  onVote: (optionId: string) => Promise<void> | void;
  children: ReactNode;
}

const formatDate = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("de-DE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso))
    : null;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

export const PollCard = ({
  poll,
  author,
  commentCount,
  optimistic,
  isExpanded,
  isVoting,
  currentUser,
  onToggle,
  onVote,
  children,
}: PollCardProps) => {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const userVote = currentUser ? poll.votesByUser[currentUser.id] : undefined;
  const endsAt = formatDate(poll.closesAt);
  const showAdminBadge = author && (author.role === Role.ADMIN || author.role === Role.HOST);

  return (
    <article
      className={`${styles.card} ${optimistic ? styles.optimistic : ""}`}
      aria-busy={optimistic}
    >
      <header className={styles.header}>
        <div className={styles.avatar}>
          {author?.avatarUrl ? (
            <img src={author.avatarUrl} alt={`${author.name} Avatar`} />
          ) : (
            <span aria-hidden="true">{author ? getInitials(author.name) : "?"}</span>
          )}
        </div>
        <div className={styles.meta}>
          <div className={styles.authorRow}>
            <span className={styles.author}>{author?.name ?? "Unbekannt"}</span>
            {showAdminBadge ? <span className={styles.badge}>Team</span> : null}
          </div>
          <time className={styles.timestamp} dateTime={poll.createdAt}>
            {formatDate(poll.createdAt)}
          </time>
        </div>
      </header>
      <div className={styles.content}>
        <h3 className={styles.question}>{poll.question}</h3>
        <ul className={styles.options}>
          {poll.options.map((option) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
            const isSelected = userVote === option.id;
            return (
              <li key={option.id} className={styles.option}>
                <button
                  type="button"
                  className={`${styles.voteButton} ${isSelected ? styles.voteButtonActive : ""}`}
                  onClick={() => onVote(option.id)}
                  disabled={!currentUser || isVoting}
                  aria-pressed={isSelected}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  <span className={styles.optionValue}>
                    {option.votes} Stimme{option.votes === 1 ? "" : "n"}
                  </span>
                </button>
                <div className={styles.progressBar} aria-hidden="true">
                  <div
                    className={`${styles.progressFill} ${
                      isSelected ? styles.progressFillActive : ""
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span
                  className={styles.percentage}
                  aria-label={`Option ${option.label} hat ${percentage}%`}
                >
                  {percentage}%
                </span>
              </li>
            );
          })}
        </ul>
        <div className={styles.summary}>
          <span>{totalVotes} abgegebene Stimmen</span>
          {endsAt ? <span>Endet: {endsAt}</span> : null}
          <span>{poll.visibility === "members" ? "Nur Mitglieder" : "Öffentlich"}</span>
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.metaRow}>
          <span className={styles.stat}>
            👍 <strong>{poll.reactions.thumbs}</strong>
          </span>
          <span className={styles.stat}>
            🔥 <strong>{poll.reactions.fire}</strong>
          </span>
          <span className={styles.stat}>
            ⭐ <strong>{poll.reactions.star}</strong>
          </span>
          <span className={styles.stat}>
            💬 <strong>{commentCount}</strong>
          </span>
        </div>
        <button
          type="button"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Kommentare schließen" : "Kommentare anzeigen"}
        </button>
      </footer>
      {isExpanded ? <div className={styles.comments}>{children}</div> : null}
    </article>
  );
};

