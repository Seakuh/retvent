import { defaultProfileImage, Profile } from "../../../utils";
import "./ProfileInfo.css";

export const ProfileInfo = ({
  profile,
  eventsCount,
  followersCount,
  followsCount,
}: {
  profile: Profile;
  eventsCount: number;
  followersCount?: number;
  followsCount?: number;
}) => {
  console.log(profile);
  return (
    <>
      <div className="profile-info">
        <div className="profile-info-header">
          <div className="profile-info-header-image"></div>
          <h1>{profile.username}</h1>
        </div>
        {/* Image */}
        <div className="profile-info-image">
          <img
            src={profile.profileImageUrl || defaultProfileImage}
            alt={profile.username}
          />
        </div>
        {/* InfoSection */}
        <div className="profile-info-info-section">
          <div className="profile-info-info-section-item">
            <p>Events</p>
            <p>{eventsCount}</p>
          </div>
          {/* <div className="profile-info-info-section-item">
          <p>Followers</p>
          <p>{followersCount}</p>
        </div>
        <div className="profile-info-info-section-item">
          <p>Follows</p>
          <p>{followsCount}</p>
        </div> */}
        </div>
        {/* Events Count */}
        {/* Followers Count */}
        {/* Follows Count */}

        <div className="profile-info-bio">
          <p>{profile.bio}</p>
        </div>
        <div className="profile-info-stats"></div>
      </div>
    </>
  );
};
