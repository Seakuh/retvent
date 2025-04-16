import { Feed } from "../../utils";
import "./Feed.css";
import { FeedCard } from "./FeedCard";

type FeedProps = {
  feeds: Feed[];
};

export const FeedComponent = ({ feeds }: FeedProps) => {
  return (
    <div>
      <div className="section-title">Explore </div>
      <div className="profile-feed-container">
        {feeds.map((feed) => (
          <FeedCard key={feed._id} feed={feed} />
        ))}
      </div>
    </div>
  );
};
