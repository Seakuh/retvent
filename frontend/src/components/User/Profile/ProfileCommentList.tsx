import { useNavigate } from "react-router-dom";
import { Comment as CommentType } from "../../../utils";
import { Comment } from "../../Comment/Comment";
import "./ProfileCommentList.css";

interface ProfileCommentListProps {
  userName: string;
  comments: CommentType[];
}

export const ProfileCommentList = ({
  userName,
  comments,
}: ProfileCommentListProps) => {
  const navigate = useNavigate();

  const handleCommentClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="profile-comment-list">
      <h2 className="comments-by">latest comments by {userName}</h2>
      <div className="user-comments-section">
        {comments.map((comment) => (
          <a
            key={comment._id}
            className="profile-comment-link"
            onClick={() => handleCommentClick(comment.eventId || "")}
          >
            <div className="comments-link-container">
              <Comment comment={comment} onReply={() => {}} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
