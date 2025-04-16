import { useEffect, useState } from "react";
import { Profile } from "../../utils";
import { ProfileCard } from "./ProfileCard";
import "./ProfileFeed.css";
import { getProfiles } from "./service";
export const ProfileFeed = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  useEffect(() => {
    getProfiles().then((profiles) => {
      setProfiles(profiles);
    });
  }, []);
  return (
    <div className="profile-feed-container">
      {profiles.map((profile) => (
        <ProfileCard key={profile._id} profile={profile} />
      ))}
    </div>
  );
};
