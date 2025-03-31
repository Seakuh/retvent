import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../Footer/Footer";
import {
  defaultProfileImage,
  Event,
  type Profile as ProfileType,
} from "../../../utils";
import { EventGalleryIII } from "../../EventGallery/EventGalleryIII";
import "./Profile.css";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { getProfile, getUserEvents, shareProfile } from "./service";

export const Profile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ProfileType | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      if (!userId) {
        setError("No user ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Parallel fetching of profile and events
        const [profileData, eventsData] = await Promise.all([
          getProfile(userId),
          getUserEvents(userId),
        ]);

        if (isMounted) {
          setUser(profileData);
          setEvents(eventsData || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile"
          );
          console.error("Error fetching profile data:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="error-container">
        <p>{error || "User not found"}</p>
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>
      </div>
    );
  }

  const countEventViews = () => {
    return events.reduce((acc, event) => acc + (event.views || 0), 0);
  };

  const ProfileMeta = () => {
    if (!user) return null;
    const userImageString = user.profileImageUrl || defaultProfileImage;

    return (
      <Helmet>
        <title>{`${user.username || "Profile"} | EventScanner`}</title>
        <meta
          name="description"
          content={`${user.username}'s profile on EventScanner - View their events and activity`}
        />
        <meta property="og:title" content={`${user.username} | EventScanner`} />
        <meta
          property="og:description"
          content={`${user.username}'s profile on EventScanner - View their events and activity`}
        />
        <meta property="og:image" content={userImageString} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="EventScanner" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:title"
          content={`${user.username} | EventScanner`}
        />
        <meta
          name="twitter:description"
          content={`${user.username}'s profile on EventScanner`}
        />
        <meta name="twitter:image" content={userImageString} />
      </Helmet>
    );
  };

  return (
    <div className="profile-wrapper">
      <ProfileMeta />

      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <div className="share-buttons">
        <button
          onClick={() => shareProfile(userId || "")}
          className="share-button"
          title="Share Profile"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <ProfileHeader
        headerImageUrl={user.headerImageUrl || defaultProfileImage}
        profileImageUrl={user.profileImageUrl || defaultProfileImage}
        username={user.username}
      />
      <div>
        <div
          className="profile-info-background"
          style={
            {
              "--profile-background-image": `url(${
                user.headerImageUrl || defaultProfileImage
              })`,
            } as React.CSSProperties
          }
        >
          <div className="profile-container">
            <h1 className="profile-header-username">{user.username}</h1>
            <div className="user-profile-info">
              <ProfileInfo
                profile={user}
                eventsCount={events.length}
                followersCount={user.followers?.length || 0}
                viewsCount={countEventViews()}
              />
            </div>
            {/* <ActionComponent
              isFollowingWIP={false}
              onFollow={() => {}}
              onMessage={() => {}}
            /> */}
          </div>
        </div>
      </div>
      <div className="user-events-section">
        {/* <h2 className="events-title">Events by {user.username}</h2> */}
        <EventGalleryIII events={events} title={`${user.username}'s Events`} />
      </div>
      <Footer />
    </div>
  );
};
