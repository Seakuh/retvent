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
    </div>
  );
};

export default CommentTextField;
