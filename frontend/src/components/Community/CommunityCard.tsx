import { useNavigate } from "react-router-dom";
import { Community } from "../../services/community.service";
import "./CommunityCard.css";

interface CommunityCardProps {
  community: Community;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/community/${community.id}`);
  };

  return (
    <div className="community-card" onClick={handleClick}>
      <div className="community-card-image">
        {community.imageUrl ? (
          <img
            src={`https://img.event-scanner.com/insecure/rs:fill:400:400/q:70/plain/${community.imageUrl}@webp`}
            alt={community.name}
            loading="lazy"
          />
        ) : (
          <div className="community-card-placeholder">
            {community.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="community-card-info">
        <h3 className="community-card-name">{community.name}</h3>
        <p className="community-card-members">{community.members.length} members</p>
      </div>
    </div>
  );
};
