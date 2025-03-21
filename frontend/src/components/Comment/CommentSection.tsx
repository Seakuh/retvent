import { useEffect, useState } from "react";
import { Comment as CommentType } from "../../utils";
import { Comment as CommentComponent } from "./Comment";
import "./CommentSection.css";
import CommentTextField from "./CommentTextField";
import { createCommentToEvent, getCommentsByEventId } from "./service";

export const CommentSection = ({ eventId }: { eventId: string }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  useEffect(() => {
    const fetchComments = async () => {
      const comments = await getCommentsByEventId(eventId);
      setComments(comments);
    };
    fetchComments();
  }, []);

  const handleAddComment = async () => {
    const comment: CommentType = {
      text: commentText,
      eventId: eventId,
    };
    const response = await createCommentToEvent(comment);
    console.log("handleAddComment", response);
    setCommentText("");
  };

  const handleReply = async (parentId: string, text: string) => {
    const comment: CommentType = {
      text: text,
      eventId: eventId,
      parentId: parentId,
    };
    console.log("handleReply", comment);
    const response = await createCommentToEvent(comment);
    console.log("handleReply", response);
    setCommentText("");
  };

  return (
    <div className="comment-section">
      <h2 className="section-headline">Comments</h2>

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
            key={comment.id}
            {...comment}
          />
        ))}
    </div>
  );
};

export default CommentSection;
