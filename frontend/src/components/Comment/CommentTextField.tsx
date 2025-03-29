import { Send } from "lucide-react";
import "./CommentTextfield.css";

export const CommentTextField = ({
  commentText,
  setCommentText,
  handleAddComment,
}: {
  commentText: string;
  setCommentText: (text: string) => void;
  handleAddComment: () => void;
}) => {
  return (
    <div className="comment-textfield-container-wrapper">
      <div className="comment-textfield-container">
        <input
          className="comment-textfield"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddComment();
            }
          }}
          placeholder="Add a comment..."
        />
        <button className="comment-textfield-button" onClick={handleAddComment}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default CommentTextField;
