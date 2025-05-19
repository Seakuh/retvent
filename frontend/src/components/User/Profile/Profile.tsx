import { ChevronLeft, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../../../Footer/Footer";
import {
  Comment as CommentType,
  defaultProfileImage,
  Event,
  formatProfileDate,
  type Profile as ProfileType,
} from "../../../utils";
import ArtistModal from "../../ArtistModal/ArtistModal";
import { EventGalleryIII } from "../../EventGallery/EventGalleryIII";
import { getProfileFeed } from "../../Feed/service";
import { ProfileBubble } from "../../ProfileBubble/ProfileBubble";
import { ActionComponent } from "./ActionComponent";
import "./Profile.css";
import { ProfileCommentList } from "./ProfileCommentList";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { PublicProfile } from "./PublicProfile";
import {
  createChat,
  fetchProfileComments,
  followUser,
  getProfile,
  getUserEvents,
  shareProfile,
  unfollowUser,
} from "./service";
export const Profile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedResponse[]>([]);
  const [user, setUser] = useState<ProfileType | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isFollowing, setIsFollowing] = useState(
    JSON.parse(localStorage.getItem("following") || "[]").includes(userId || "")
  );
  const [comments, setComments] = useState<CommentType[]>([]);
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
        const [profileData, eventsData, feedData] = await Promise.all([
          getProfile(userId),
          getUserEvents(userId),
          getProfileFeed(userId),
        ]);
        fetchProfileComments(profileData?.userId || "").then(
          ({ comments, count }) => {
            setComments(comments);
            setCommentsCount(count);
          }
        );

        if (isMounted) {
          setUser(profileData);
          setEvents(eventsData || []);
          setFeed(feedData || []);
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
    console.log(feed);

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
    return <PublicProfile />;
  }

  if (error || !user) {
    return (
      <div className="error-container">
        <ArtistModal onClose={() => {}} artistName={userId || ""} />
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
      const newFollowing = following.filter((id: string) => id !== userId);
      localStorage.setItem("following", JSON.stringify(newFollowing));
      unfollowUser(userId || "");
    } else {
      following.push(userId);
      localStorage.setItem("following", JSON.stringify(following));
      followUser(userId || "");
    }
    setIsFollowing(!isFollowing);
  };

  const handleMessage = async () => {
    if (userId === localStorage.getItem("user.id")) {
      return;
    }
    if (localStorage.getItem("user.id") === null) {
      navigate("/login");
      return;
    }
    const response = await createChat(userId || "");
    navigate(`/group/${response._id}`);
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
          username={user.username}
        />
        <div className="profile-bubble-container">
          <ProfileBubble feedItemsResponse={feed} size="large" />
        </div>
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
          {/* <ProfileFeed profileId={userId || ""} /> */}
          {/* <h2 className="events-title">Events by {user.username}</h2> */}
          <EventGalleryIII
            events={events}
            title={`${user.username}'s Events`}
          />
        </div>
        <ProfileCommentList userName={user.username} comments={comments} />
        <div className="member-since-profile">
          Member since {formatProfileDate(new Date(user.createdAt || ""))}
        </div>
        <Footer />
      </div>
    </div>
  );
};
