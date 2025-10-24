import { FormEvent, useMemo, useState } from "react";
import { Comment, Member } from "../../types/community.types";
import { canComment, canDeleteComment } from "../../utils/permissions";
import styles from "./CommentThread.module.css";

interface CommentThreadProps {
  comments: Comment[];
  members: Record<string, Member>;
  currentUser?: Member | null;
  isSubmitting?: boolean;
  isLoading?: boolean;
  pendingDeletes?: Record<string, boolean>;
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

const formatRelativeTime = (iso: string) => {
  const formatter = new Intl.RelativeTimeFormat("de", { style: "short" });
  const date = new Date(iso);
  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / (1000 * 60));
  const hours = Math.round(diff / (1000 * 60 * 60));
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }
  return formatter.format(days, "day");
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

export const CommentThread = ({
  comments,
  members,
  currentUser,
  isSubmitting,
  isLoading,
  pendingDeletes = {},
  onAddComment,
  onDeleteComment,
}: CommentThreadProps) => {
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<string | null>(null);

  const canUserComment = canComment(currentUser);

  const grouped = useMemo(() => {
    const roots: Comment[] = [];
    const replies: Record<string, Comment[]> = {};
    comments.forEach((comment) => {
      if (comment.parentId) {
        if (!replies[comment.parentId]) {
          replies[comment.parentId] = [];
        }
        replies[comment.parentId].push(comment);
      } else {
        roots.push(comment);
      }
    });
    Object.values(replies).forEach((list) =>
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    );
    roots.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { roots, replies };
  }, [comments]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }
    await onAddComment(content.trim());
    setContent("");
  };

  const handleReplySubmit = async (event: FormEvent<HTMLFormElement>, parentId: string) => {
    event.preventDefault();
    const value = replyContent[parentId]?.trim();
    if (!value) {
      return;
    }
    await onAddComment(value, parentId);
    setReplyContent((prev) => ({ ...prev, [parentId]: "" }));
    setReplyTarget(null);
  };

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>Kommentare</h4>
      {isLoading ? (
        <p className={styles.empty}>Kommentare werden geladen …</p>
      ) : grouped.roots.length === 0 ? (
        <p className={styles.empty}>Noch keine Kommentare. Starte die Diskussion!</p>
      ) : (
        <ul className={styles.list}>
          {grouped.roots.map((comment) => {
            const author = members[comment.authorId];
            const canDelete = currentUser
              ? canDeleteComment(currentUser, comment.authorId)
              : false;
            const replies = grouped.replies[comment.id] ?? [];
            return (
              <li key={comment.id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.avatar}>
                    {author?.avatarUrl ? (
                      <img src={author.avatarUrl} alt={`${author.name} Avatar`} />
                    ) : (
                      <span aria-hidden="true">{author ? getInitials(author.name) : "?"}</span>
                    )}
                  </div>
                  <div className={styles.meta}>
                    <span className={styles.author}>{author?.name ?? "Unbekannt"}</span>
                    <time className={styles.timestamp} dateTime={comment.createdAt}>
                      {formatRelativeTime(comment.createdAt)}
                    </time>
                  </div>
                </div>
                <div className={styles.commentBody}>
                  {comment.deleted ? (
                    <p className={styles.deleted}>Dieser Kommentar wurde gelöscht.</p>
                  ) : (
                    <p className={styles.text}>{comment.content}</p>
                  )}
                  <div className={styles.actions}>
                    {canUserComment ? (
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() =>
                          setReplyTarget((prev) => (prev === comment.id ? null : comment.id))
                        }
                      >
                        Antworten
                      </button>
                    ) : null}
                    {canDelete ? (
                      <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => onDeleteComment(comment.id)}
                        disabled={pendingDeletes[comment.id]}
                      >
                        {pendingDeletes[comment.id] ? "Löschen…" : "Löschen"}
                      </button>
                    ) : null}
                  </div>
                </div>
                {replyTarget === comment.id && canUserComment ? (
                  <form
                    className={styles.replyForm}
                    onSubmit={(event) => handleReplySubmit(event, comment.id)}
                  >
                    <label htmlFor={`${comment.id}-reply`} className={styles.label}>
                      Antwort verfassen
                    </label>
                    <textarea
                      id={`${comment.id}-reply`}
                      value={replyContent[comment.id] ?? ""}
                      onChange={(event) =>
                        setReplyContent((prev) => ({
                          ...prev,
                          [comment.id]: event.target.value,
                        }))
                      }
                      className={styles.textarea}
                      rows={3}
                      placeholder="Was möchtest du sagen?"
                    />
                    <div className={styles.replyActions}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setReplyTarget(null)}
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || !(replyContent[comment.id]?.trim())}
                      >
                        Antworten
                      </button>
                    </div>
                  </form>
                ) : null}
                {replies.length > 0 ? (
                  <ul className={styles.replyList}>
                    {replies.map((reply) => {
                      const author = members[reply.authorId];
                      const canDelete = currentUser
                        ? canDeleteComment(currentUser, reply.authorId)
                        : false;
                      return (
                        <li key={reply.id} className={styles.reply}>
                          <div className={styles.replyHeader}>
                            <div className={styles.replyAvatar}>
                              {author?.avatarUrl ? (
                                <img src={author.avatarUrl} alt={`${author.name} Avatar`} />
                              ) : (
                                <span aria-hidden="true">
                                  {author ? getInitials(author.name) : "?"}
                                </span>
                              )}
                            </div>
                            <div className={styles.meta}>
                              <span className={styles.author}>{author?.name ?? "Unbekannt"}</span>
                              <time className={styles.timestamp} dateTime={reply.createdAt}>
                                {formatRelativeTime(reply.createdAt)}
                              </time>
                            </div>
                          </div>
                          <div className={styles.commentBody}>
                            {reply.deleted ? (
                              <p className={styles.deleted}>Kommentar entfernt.</p>
                            ) : (
                              <p className={styles.text}>{reply.content}</p>
                            )}
                            {canDelete ? (
                              <button
                                type="button"
                                className={styles.actionButton}
                                onClick={() => onDeleteComment(reply.id)}
                                disabled={pendingDeletes[reply.id]}
                              >
                                {pendingDeletes[reply.id] ? "Löschen…" : "Löschen"}
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {canUserComment ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="new-comment" className={styles.label}>
            Kommentar hinzufügen
          </label>
          <textarea
            id="new-comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Teile deine Gedanken …"
            required
          />
          <button type="submit" className={styles.submitButton} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Senden…" : "Veröffentlichen"}
          </button>
        </form>
      ) : (
        <p className={styles.loginHint}>Melde dich an, um einen Kommentar zu schreiben.</p>
      )}
    </div>
  );
};

