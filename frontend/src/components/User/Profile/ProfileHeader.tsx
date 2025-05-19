import { defaultProfileImage, FeedResponse } from "../../../utils";
import "./ProfileHeader.css";
export const ProfileHeader = ({
  headerImageUrl,
  profileImageUrl,
  username,
  feed,
}: {
  headerImageUrl: string;
  profileImageUrl: string;
  username: string;
  feed: FeedResponse[];
}) => {
  return (
    <div>
      <img
        className="profile-header-image"
        src={headerImageUrl || defaultProfileImage}
        alt={username}
      />
    </div>
  );
};
