import { useState } from "react";
import { Comment as CommentType } from "../../utils";
import "./Comment.css";
import CommentTextField from "./CommentTextField";

interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string, text: string) => void;
  depth?: number;
}

export const Comment = ({ comment, onReply, depth = 0 }: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (replyText.trim() && comment._id) {
      onReply(comment._id, replyText);
      setReplyText("");
      setIsReplying(false);
    }
  };

  const maxDepth = 5;
  const canReply = depth < maxDepth;

  const toLocaleString = (date: string | undefined) => {
    if (!date) return "";
    const diff = new Date().getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 365) return `${diffDays} days ago`;
    return `${diffYears} years ago`;
  };

  return (
    <div
      className="comment-component-container"
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="comment-content">
        <div className="comment-meta">
          {/* <span className="comment-user">{comment.userId}</span> */}
          {/* <span className="comment-separator">•</span> */}
          <span className="comment-date">
            {toLocaleString(comment.createdAt)}
          </span>
        </div>
        <div className="comment-text">{comment.text}</div>
      </div>

      {canReply && (
        <button
          className="comment-reply-button"
          onClick={() => setIsReplying(!isReplying)}
        >
          {isReplying ? "cancel" : "reply"}
        </button>
      )}

      {isReplying && (
        <div className="reply-form">
          <CommentTextField
            commentText={replyText}
            setCommentText={setReplyText}
            handleAddComment={handleSubmitReply}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="nested-comments">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
