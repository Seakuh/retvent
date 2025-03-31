import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Profile as ProfileType } from "../../../utils";
import { EventGalleryIII } from "../../EventGallery/EventGalleryIII";
import "./Profile.css";
import { getProfile, getUserEvents } from "./service";

export const Profile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<ProfileType | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const user = await getProfile(userId);
        setUser(user);
      }
    };

    const fetchEvents = async () => {
      if (userId) {
        const events = await getUserEvents(userId);
        setEvents(events);
      }
    };
    fetchUser();
    fetchEvents();
  }, [userId]);

  console.log(user);
  return (
    <div className="profile-container">
      <button
        className="back-button"
        onClick={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/");
          }
        }}
      >
        ← Back
      </button>
      <div className="user-profile-info">
        <div>
          <h1>{userId || "User"}</h1>
          {/* <p>{user?.uploads}</p>
      <p>{user?.events.length}</p>
      <p>{user?.likedEvents.length}</p> */}
          <EventGalleryIII events={events || []} />
        </div>
      </div>
    </div>
  );
};
