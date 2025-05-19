import { defaultProfileImage } from "../../../utils";
import "./ProfileHeader.css";
export const ProfileHeader = ({
  headerImageUrl,
  username,
}: {
  headerImageUrl: string;
  username: string;
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
