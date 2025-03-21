import { useEffect, useState } from "react";
import { buildCommentTree, Comment as CommentType } from "../../utils";
import { Comment as CommentComponent } from "./Comment";
import "./CommentSection.css";
import CommentTextField from "./CommentTextField";
import { createCommentToEvent, getCommentsByEventId } from "./service";

export const CommentSection = ({ eventId }: { eventId: string }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState<string>("");

  useEffect(() => {
    const fetchComments = async () => {
      const fetchedComments = await getCommentsByEventId(eventId);
      const commentTree = buildCommentTree(fetchedComments);
      setComments(commentTree);
    };
    fetchComments();
  }, [eventId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const comment: CommentType = {
      text: commentText,
      eventId: eventId,
    };
    const response = await createCommentToEvent(comment);
    if (response.ok) {
      const fetchedComments = await getCommentsByEventId(eventId);
      const commentTree = buildCommentTree(fetchedComments);
      setComments(commentTree);
      setCommentText("");
    }
  };

  const handleReply = async (parentId: string, text: string) => {
    if (!text.trim()) return;

    const comment: CommentType = {
      text: text,
      eventId: eventId,
      parentId: parentId,
    };
    const response = await createCommentToEvent(comment);
    if (response.ok) {
      const fetchedComments = await getCommentsByEventId(eventId);
      const commentTree = buildCommentTree(fetchedComments);
      setComments(commentTree);
    }
  };

  return (
    <div className="comment-section">
      <h2 className="section-headline">Kommentare</h2>

      <CommentTextField
        commentText={commentText}
        setCommentText={setCommentText}
        handleAddComment={handleAddComment}
      />
      {comments.length > 0 &&
        comments.map((comment) => (
          <CommentComponent
            comment={comment}
            onReply={handleReply}
            key={comment._id}
            depth={0}
          />
        ))}
    </div>
  );
};

export default CommentSection;
