import { Profile } from "../../../utils";
import "./ProfileInfo.css";

export const ProfileInfo = ({ profile }: { profile: Profile }) => {
  console.log(profile);
  return (
    <div className="profile-info">
      <div className="profile-info-header">
        <img src={profile.profileImageUrl} alt={profile.username} />
        <h1>{profile.username}</h1>
      </div>
      {/* Image */}
      {/* InfoSection */}
      <div className="profile-info-info-section">
        <div className="profile-info-info-section-item">
          <p>Events</p>
          <p>{profile.events.length}</p>
        </div>
        <div className="profile-info-info-section-item">
          <p>Followers</p>
        </div>
        <div className="profile-info-info-section-item">
          <p>Follows</p>
        </div>
      </div>
      {/* Events Count */}
      {/* Followers Count */}
      {/* Follows Count */}

      <div className="profile-info-bio">
        <p>{profile.bio}</p>
      </div>
      <div className="profile-info-stats"></div>
    </div>
  );
};
