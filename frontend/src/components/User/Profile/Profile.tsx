import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../Footer/Footer";
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

  const HelmetMeta = () => {
    return (
      <Helmet>
        <title>{`${user?.username || "Public Profiles"} | EventScanner`}</title>
        <meta
          name="description"
          content={`${user?.username}'s profile on EventScanner`}
        />
        <meta
          name="keywords"
          content={`${user?.username}, EventScanner, events, concerts, festivals, shows, tickets`}
        />
        <meta
          property="og:title"
          content={`${user?.username} | EventScanner`}
        />
        <meta
          property="og:description"
          content={`${user?.username}'s profile on EventScanner`}
        />
        <meta property="og:image" content={user?.profilePictureUrl} />
        <meta property="og:url" content={`${window.location.href}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="EventScanner" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="de_DE" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={`${user?.username} profile picture`}
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>
    );
  };

  return (
    <div className="profile-container">
      <HelmetMeta />
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
      <Footer />
    </div>
  );
};
