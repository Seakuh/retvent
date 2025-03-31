import { formatProfileDate, Profile } from "../../../utils";
import "./ProfileInfo.css";
import { ProfileLinks } from "./ProfileLinks";

export const ProfileInfo = ({
  profile,
  eventsCount,
  followersCount,
  viewsCount,
}: {
  profile: Profile;
  eventsCount: number;
  followersCount?: number;
  viewsCount?: number;
}) => {
  return (
    <div className="profile-info-container">
      <div className="profile-info-stats">
        <div className="stat-item">
          <p>Events</p>
          <p>{eventsCount || 0}</p>
        </div>
        <div className="stat-item">
          <p>Followers</p>
          <p>{followersCount || 0}</p>
        </div>
        <div className="stat-item">
          <p>Views</p>
          <p>{viewsCount || 0}</p>
        </div>
      </div>
      {profile.bio && (
        <div className="profile-info-bio">
          <p>{profile.bio || ""}</p>
        </div>
      )}
      {profile.links && profile.links.length > 0 && (
        <div className="profile-info-links">
          <ProfileLinks links={profile.links} />
        </div>
      )}
      <div className="member-since-profile">
        Member since {formatProfileDate(new Date(profile.createdAt || ""))}
      </div>
    </div>
  );
};
