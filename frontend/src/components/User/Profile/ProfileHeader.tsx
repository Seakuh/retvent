import { defaultProfileImage } from "../../../utils";
import "./ProfileHeader.css";

export const ProfileHeader = ({
  headerImageUrl,
  profileImageUrl,
  username,
}: {
  headerImageUrl: string;
  profileImageUrl: string;
  username: string;
}) => {
  return (
    <div>
      <img
        className="profile-header-image"
        src={headerImageUrl || defaultProfileImage}
        alt={username}
      />
      <div className="profile-header-profile-image">
        <img src={profileImageUrl || defaultProfileImage} alt={username} />
      </div>
    </div>
  );
};
