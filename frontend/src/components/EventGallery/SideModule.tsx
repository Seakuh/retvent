import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Event } from "../../utils";
import { ProfileBubble } from "../ProfileBubble/ProfileBubble";
import "./SideModule.css";
export const SideModule = ({ events }: { events: Event[] }) => {
  const { user } = useContext(UserContext);
  console.log(user);
  console.log(events);
  return (
    <div className="side-module-container">
      <div className="side-module-header"></div>
      <div className="side-module-content">
        <div className="side-module-profile-recommendations">
          <div className="side-module-profile-recommendations-content">
            <div className="side-module-profile-recommendations-content-item">
              <ProfileBubble
                profileId={user?.id || ""}
                profileImageUrl={user?.profileImageUrl || ""}
              />
            </div>
          </div>
        </div>
        <div className="side-module-events">
          {events.slice(0, 4).map((event) => (
            <li key={event.id}>
              <div className="side-module-event-card">
                <div className="side-module-event-card-content">
                  <ProfileBubble
                    profileId={event.hostId}
                    profileImageUrl={event.hostProfileImageUrl}
                  />
                  <h3>{event.hostUsername}</h3>
                </div>
              </div>
            </li>
          ))}
        </div>
        <div className="side-module-footer">
          <div className="side-module-footer-links">
            <a href="/about">About</a>
            <a href="/information">Information</a>
            <a href="/community-guidelines">Community Guidelines</a>
          </div>
        </div>
      </div>
    </div>
  );
};
