import { Comment, Feed, User } from "../../../utils";
import "./ProfileFeed.css";

interface ProfileFeedProps {
  user: User;
  comments: Comment[];
  feed: Feed[];
}

export const ProfileFeed = ({ user, comments, feed }: ProfileFeedProps) => {
  return <div>ProfileFeed</div>;
};
