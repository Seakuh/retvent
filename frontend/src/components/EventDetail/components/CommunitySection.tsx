import { Eye, MessageCircle } from "lucide-react";
import "./CommunitySection.css";
interface CommunitySectionProps {
  views: number;
  commentCount: number;
  city: string;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({
  views,
  commentCount,
  city,
}) => {
  return (
    <div className="community-meta-container">
      {/* <span className="location">
        <MapPin size={16} />
        {city || "TBA"}
      </span> */}
      {/* <div className="community-meta-container-left">
        <span className="location">
          <MapPin size={16} />
          {city || "TBA"}
        </span>
      </div> */}
      <div className="community-meta-container-right">
        <span className="community-meta-comments">
          <MessageCircle size={16} />
          {commentCount}
        </span>
        <span className="community-meta-views">
          <Eye size={16} />
          {views}
        </span>
      </div>
    </div>
  );
};
