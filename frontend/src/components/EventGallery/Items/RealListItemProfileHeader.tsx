import { Ellipsis, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./RealListItemProfileHeader.css";

interface RealListItemProfileHeaderProps {
  profileUrl?: string;
  name?: string;
  id?: string;
  location?: string;
}

export const RealListItemProfileHeader = ({
  profileUrl,
  name,
  location,
  id,
}: RealListItemProfileHeaderProps) => {
  const navigate = useNavigate();
  const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    navigate(`/profile/${id}`);
  };

  const handleEllipsisClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    console.log("ellipsis clicked");
    navigate("/imprint");
  };
  return (
    <div className="real-list-item-profile-header">
      <div className="real-list-item-profile-header-left">
        <img
          className="real-list-item-profile-header-image"
          src={`https://img.event-scanner.com/insecure/rs:fill:40:40/q:70/plain/${profileUrl}@webp`}
          alt={name}
          onClick={handleOnClick}
        />
        <div className="real-list-item-profile-header-name-container">
          <h3 className="real-list-item-profile-header-name">
            {name || "Public"}
          </h3>
          <p className="real-list-item-profile-header-location">
            <MapPin size={14} />
            {location}
          </p>
        </div>
      </div>
      <div className="real-list-item-profile-header-right">
        <Ellipsis
          className="real-list-item-profile-header-ellipsis"
          size={25}
          color="white"
          onClick={(e) => handleEllipsisClick(e)}
        />
      </div>
    </div>
  );
};
