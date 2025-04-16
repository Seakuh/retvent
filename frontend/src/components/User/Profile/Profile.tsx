import { ChevronLeft, Share2, ShieldHalf } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../Footer/Footer";
import {
  defaultProfileImage,
  Event,
  formatProfileDate,
  type Profile as ProfileType,
} from "../../../utils";
import { EventGalleryIII } from "../../EventGallery/EventGalleryIII";
import { ActionComponent } from "./ActionComponent";
import "./Profile.css";
import { ProfileCommentList } from "./ProfileCommentList";
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
  const [isFollowing, setIsFollowing] = useState(
    JSON.parse(localStorage.getItem("following") || "[]").includes(userId || "")
  );
  const [commentsCount, setCommentsCount] = useState(0);
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

  const handleBack = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const previousPath = document.referrer;
      const isFromOurSite = previousPath.includes(window.location.hostname);

      if (isFromOurSite) {
        navigate(-1);
      } else {
        navigate("/");
      }
    },
    [navigate]
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (userId === "public") {
    return (
      <div className="h-screen w-screen">
        <button className="back-button" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>

        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
          <ShieldHalf className="w-20 h-20 text-white mx-auto  mb-4 mt-20" />

          <h1 className="text-center text-white text-xl font-bold mt-6">
            This contribution was uploaded public by the community.
            <br />
            <br />
            <p>
              If you want to upload your own events, <br />
              please login and upload your own events.
            </p>
          </h1>
          <a
            href="https://event-scanner.com"
            className="flex mt-2 justify-center"
          >
            <img
              src="/logo.png"
              alt="Event-Scanner"
              className="w-16 h-16 border border-[var(--color-neon-blue)] mt-20 rounded-xl"
            />
          </a>
          <div className="flex text-white mt-8 text-center max-w-[550px] mx-auto">
            <p className="text-white text-sm text-center mt-4 max-w-[550px] mx-auto">
              Event-Scanner is an open platform where users can publish content.
              The operators are not responsible for third-party posts. If you
              come across any illegal or offensive content, please report it via{" "}
              <a href="mailto:info@event-scanner.com" className="underline">
                info@event-scanner.com
              </a>
              . We carefully review every report and will remove content that
              violates our policies. Comments may be posted anonymously but must
              follow our{" "}
              <a href="/comment-guidelines" className="underline">
                Comment Guidelines
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="error-container">
        <p>{error || "User not found"}</p>
        <button onClick={handleBack} className="back-button">
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
      </div>
    );
  }

  const countEventViews = () => {
    return events.reduce((acc, event) => acc + (event.views || 0), 0);
  };

  const handleFollow = () => {
    const following = JSON.parse(localStorage.getItem("following") || "[]");
    if (isFollowing) {
      const newFollowing = following.filter((id: string) => id !== user._id);
      localStorage.setItem("following", JSON.stringify(newFollowing));
    } else {
      following.push(user._id);
      localStorage.setItem("following", JSON.stringify(following));
    }
    setIsFollowing(!isFollowing);
  };

  const handleMessage = () => {
    console.log("Message");
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
    <div className="profile-page-container">
      <div className="profile-wrapper">
        <ProfileMeta />

        <button className="back-button" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />{" "}
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
          <div className="profile-info-background">
            <div className="profile-container">
              <h1 className="profile-header-username">{user.username}</h1>
              <div className="user-profile-info">
                <ProfileInfo
                  profile={user}
                  eventsCount={events.length}
                  commentsCount={commentsCount}
                  viewsCount={countEventViews()}
                />
              </div>
              <ActionComponent
                isFollowingWIP={isFollowing}
                onFollow={handleFollow}
                onMessage={handleMessage}
              />
            </div>
          </div>
        </div>
        <div className="user-events-section">
          {/* <h2 className="events-title">Events by {user.username}</h2> */}
          <EventGalleryIII
            events={events}
            title={`${user.username}'s Events`}
          />
        </div>
        <ProfileCommentList
          userName={user.username}
          commentsCount={commentsCount}
          setCommentsCount={setCommentsCount}
        />
        <div className="member-since-profile">
          Member since {formatProfileDate(new Date(user.createdAt || ""))}
        </div>
        <Footer />
      </div>
    </div>
  );
};
