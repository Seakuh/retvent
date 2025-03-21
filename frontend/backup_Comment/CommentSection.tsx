import { useEffect, useState } from "react";
import { Comment as CommentType } from "../../utils";
import { Comment as CommentComponent } from "./Comment";
import "./CommentSection.css";
import CommentTextField from "./CommentTextField";
import { getCommentsByEventId } from "./service";

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

  return (
    <div className="comment-section">
      <CommentTextField
        commentText={commentText}
        setCommentText={setCommentText}
      />
      {comments.length > 0 &&
        comments.map((comment) => (
          <CommentComponent key={comment.id} {...comment} />
        ))}
    </div>
  );
};

export default CommentSection;
