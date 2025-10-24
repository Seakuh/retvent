import { ReactNode } from "react";
import { Member, NewsPost, Role } from "../../types/community.types";
import styles from "./NewsPostCard.module.css";

interface NewsPostCardProps {
  post: NewsPost;
  author?: Member;
  commentCount: number;
  optimistic?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

export const NewsPostCard = ({
  post,
  author,
  commentCount,
  optimistic,
  isExpanded,
  onToggle,
  children,
}: NewsPostCardProps) => {
  const previewWords = 80;
  const isLongText = post.body.split(/\s+/).length > previewWords;
  const preview = isLongText
    ? `${post.body.split(/\s+/).slice(0, previewWords).join(" ")} …`
    : post.body;
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
          <time className={styles.timestamp} dateTime={post.createdAt}>
            {formatDate(post.createdAt)}
          </time>
        </div>
      </header>
      <div className={styles.content}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.body}>{isExpanded || !isLongText ? post.body : preview}</p>
        {post.imageUrl ? (
          <figure className={styles.media}>
            <img src={post.imageUrl} alt="" />
          </figure>
        ) : null}
      </div>
      <footer className={styles.footer}>
        <div className={styles.metaRow}>
          <span className={styles.stat}>
            👍 <strong>{post.reactions.thumbs}</strong>
          </span>
          <span className={styles.stat}>
            🔥 <strong>{post.reactions.fire}</strong>
          </span>
          <span className={styles.stat}>
            ⭐ <strong>{post.reactions.star}</strong>
          </span>
          <span className={styles.stat}>
            💬 <strong>{commentCount}</strong>
          </span>
        </div>
        {isLongText || commentCount > 0 ? (
          <button
            type="button"
            className={styles.toggle}
            onClick={onToggle}
            aria-expanded={isExpanded}
          >
            {isExpanded ? "Weniger anzeigen" : "Alles anzeigen & Kommentare"}
          </button>
        ) : null}
      </footer>
      {isExpanded ? <div className={styles.comments}>{children}</div> : null}
    </article>
  );
};

