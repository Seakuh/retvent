import { defaultProfileImage, Profile } from "../../utils";
import "./ProfileCard.css";
export const ProfileCard = ({ profile }: { profile: Profile }) => {
  return (
    <div className="profile-card-container">
      <div className="profile-card-border">
        <div className="profile-card-inner">
          <img
            className="profile-card-image"
            src={profile.profileImageUrl || defaultProfileImage}
            alt={profile.username}
          />
        </div>
      </div>
      <div className="profile-card-username-container">
        <h3 className="profile-card-username">
          {profile.username || "Profile"}
        </h3>
      </div>
    </div>
  );
};
