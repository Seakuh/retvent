import { Comment as CommentType } from "../../utils";

export const Comment = (comment: CommentType) => {
  return <div>{comment.content}</div>;
};

export default Comment;
