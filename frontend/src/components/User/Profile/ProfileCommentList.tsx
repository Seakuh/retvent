import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Comment as CommentType } from "../../../utils";
import { Comment } from "../../Comment/Comment";
import "./ProfileCommentList.css";
import { fetchProfileComments } from "./service";

export const ProfileCommentList = ({ userName }: { userName: string }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const navigate = useNavigate();
  console.log(comments);

  useEffect(() => {
    fetchProfileComments(userId).then(setComments);
  }, [userId]);

  const handleCommentClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="profile-comment-list">
      <h2 className="comments-by">Comments by {userName}</h2>
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
