import { ChevronLeft, LogOut, MoreVertical, Share2, User as UserIcon, Mail, FileText, Link as LinkIcon, Calendar, Moon, Sun, Sparkles, X } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext, type User as UserContextUser } from "../../../contexts/UserContext";
import { useTheme } from "../../../contexts/ThemeContext";
import Footer from "../../../Footer/Footer";
import {
  API_URL,
  Comment as CommentType,
  defaultProfileImage,
  defaultUserPreferences,
  Event,
  fallBackProfileImage,
  FeedResponse,
  formatProfileDate,
  handleLogout,
  type Profile as ProfileType,
  UserPreferences,
} from "../../../utils";
import ArtistModal from "../../ArtistModal/ArtistModal";
import { EmbeddingPreferences } from "../../EventDetail/components/EmbeddingPreferences/EmbeddingPreferences";
import { EventGalleryIII } from "../../EventGallery/EventGalleryIII";
import { getProfileFeed } from "../../Feed/service";
import { LevelSection } from "../../LevelSection/LevelSection";
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
import { meService } from "../Me/service";
export const Profile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { setUser: setContextUser } = useContext(UserContext);
  const { theme, toggleTheme } = useTheme();
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
  
  // Own profile state
  const getCurrentUserId = () => {
    const userFromStorage = localStorage.getItem("user.id");
    if (userFromStorage) return userFromStorage;
    
    try {
      const userObj = localStorage.getItem("user");
      if (userObj) {
        const parsed = JSON.parse(userObj);
        return parsed?.id || null;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
    return null;
  };
  
  const currentUserId = getCurrentUserId();
  const isOwnProfile = userId === currentUserId && currentUserId !== null;
  const [points, setPoints] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changedFields, setChangedFields] = useState<Partial<ProfileType>>({});
  const [headerImage, setHeaderImage] = useState<string>(fallBackProfileImage);
  const [profileImage, setProfileImage] = useState<string>(fallBackProfileImage);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isGeneratingMagicBio, setIsGeneratingMagicBio] = useState(false);
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

        // If own profile, fetch from /users/me/profile to get points
        let profileData;
        if (isOwnProfile && currentUserId) {
          profileData = await meService.getMe(currentUserId);
        } else {
          profileData = await getProfile(userId);
        }

        // Parallel fetching of events and feed
        const [eventsData, feedData] = await Promise.all([
          getUserEvents(userId),
          getProfileFeed(userId),
        ]);
        
        // Fetch comments only if userId exists
        if (profileData?.userId || profileData?.id) {
          fetchProfileComments(profileData?.userId || profileData?.id || userId).then(
            ({ comments, count }) => {
              setComments(comments || []);
              setCommentsCount(count || 0);
            }
          ).catch((error) => {
            console.error("Error fetching profile comments:", error);
            setComments([]);
            setCommentsCount(0);
          });
        } else {
          setComments([]);
          setCommentsCount(0);
        }

        if (isMounted) {
          setUser(profileData);
          setEvents(eventsData || []);
          setFeed(feedData || []);
          
          // If own profile, set additional state including points
          if (isOwnProfile && profileData) {
            setPoints(profileData.points || 0);
            setHeaderImage(profileData.headerImageUrl || fallBackProfileImage);
            setProfileImage(profileData.profileImageUrl || fallBackProfileImage);
          }
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
  }, [userId, isOwnProfile]);

  // Load preferences for own profile
  useEffect(() => {
    if (!isOwnProfile || !currentUserId) return;
    
    const loadPreferences = async () => {
      const localPreferences = localStorage.getItem("preferences");
      if (localPreferences) {
        setPreferences(JSON.parse(localPreferences));
      } else {
        try {
          const prefs = await meService.getPreferences(currentUserId);
          setPreferences(prefs);
        } catch (error) {
          console.error("Error loading preferences:", error);
        }
      }
    };
    
    loadPreferences();
  }, [isOwnProfile, currentUserId]);

  // Handlers for own profile
  const handleChange = useCallback(
    (field: keyof ProfileType, value: string) => {
      if (!user) return;
      setChangedFields((prev) => ({ ...prev, [field]: value }));
    },
    [user]
  );

  const handleChangeLinks = useCallback(
    (field: keyof ProfileType, value: string) => {
      if (!user) return;
      const links = value.split(",").map((link) => link.trim());
      setChangedFields((prev) => ({ ...prev, [field]: links }));
    },
    [user]
  );

  const handleUpdate = useCallback(async () => {
    if (!user || !currentUserId || Object.keys(changedFields).length === 0) return;

    try {
      setIsUpdating(true);
      const updatedProfile = await meService.updateProfile(
        currentUserId,
        changedFields
      );
      setUser((prev) => (prev ? { ...prev, ...updatedProfile } : null));
      if (setContextUser && updatedProfile) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}") as UserContextUser | null;
        if (currentUser && currentUser.id) {
          setContextUser({ 
            ...currentUser, 
            username: updatedProfile.username || currentUser.username,
            email: updatedProfile.email || currentUser.email,
            profileImageUrl: updatedProfile.profileImageUrl || currentUser.profileImageUrl,
            headerImageUrl: updatedProfile.headerImageUrl || currentUser.headerImageUrl,
          });
        }
      }
      setChangedFields({});
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [user, currentUserId, changedFields, setContextUser]);

  const handleImageUpload = useCallback(
    async (type: "header" | "profile", file: File) => {
      if (!currentUserId) return;

      try {
        setIsImageUploading(true);
        const response =
          type === "header"
            ? await meService.updateHeaderImage(currentUserId, file)
            : await meService.updateProfileImage(currentUserId, file);

        if (!response.ok) {
          throw new Error(`Error updating ${type} image`);
        }

        const data = await response.json();
        const imageUrl =
          type === "header" ? data.headerImageUrl : data.profileImageUrl;

        if (type === "header") {
          setHeaderImage(imageUrl);
        } else {
          setProfileImage(imageUrl);
        }

        setUser((prev) =>
          prev ? { ...prev, [`${type}ImageUrl`]: imageUrl } : null
        );
      } catch (error) {
        console.error(`Error updating ${type} image:`, error);
      } finally {
        setIsImageUploading(false);
      }
    },
    [currentUserId]
  );

  const createFileInput = useCallback(
    (type: "header" | "profile") => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await handleImageUpload(type, file);
        }
        fileInput.remove();
      };
      fileInput.click();
    },
    [handleImageUpload]
  );

  const savePreferences = useCallback(
    (preferences: UserPreferences) => {
      setPreferences(preferences);
      if (currentUserId) {
        meService.updatePreferences(currentUserId, preferences);
      }
      localStorage.setItem("preferences", JSON.stringify(preferences));
      setIsPreferencesOpen(false);
    },
    [currentUserId]
  );

  const handleEditEvent = useCallback((eventId: string) => {
    navigate(`/admin/events/edit/${eventId}`);
  }, [navigate]);

  const handleGenerateMagicBio = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsGeneratingMagicBio(true);
    try {
      // Use current bio as prompt, or empty string if none
      const currentBio = changedFields.bio !== undefined ? changedFields.bio : (user?.bio || "");
      const accessToken = localStorage.getItem("access_token");
      
      const response = await fetch(`${API_URL}profile/${currentUserId}/magic-bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ bio: currentBio }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate magic bio");
      }

      const data = await response.json();
      const magicBio = data.bio || data.description || "";
      
      // Update the bio field with the generated bio
      handleChange("bio", magicBio);
    } catch (err) {
      console.error("Error generating magic bio:", err);
      alert(err instanceof Error ? err.message : "Failed to generate magic bio. Please try again.");
    } finally {
      setIsGeneratingMagicBio(false);
    }
  }, [currentUserId, changedFields.bio, user?.bio, handleChange]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSection) {
        setActiveSection(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [activeSection]);

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
      {isPreferencesOpen && (
        <EmbeddingPreferences
          preferences={preferences}
          onSave={savePreferences}
          onClose={() => setIsPreferencesOpen(false)}
        />
      )}
      <div className="profile-wrapper">
        <ProfileMeta />

        <button className="back-button" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
        <div className="share-buttons">
          {isOwnProfile ? (
            <div className="profile-menu-container">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="profile-menu-trigger"
                title="Menu"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="profile-menu-overlay"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="profile-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        setActiveSection("username");
                        setShowMenu(false);
                      }}
                    >
                      <UserIcon size={18} style={{ marginRight: 8 }} />
                      Username
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        setActiveSection("email");
                        setShowMenu(false);
                      }}
                    >
                      <Mail size={18} style={{ marginRight: 8 }} />
                      Email
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        setActiveSection("bio");
                        setShowMenu(false);
                      }}
                    >
                      <FileText size={18} style={{ marginRight: 8 }} />
                      Bio
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        setActiveSection("links");
                        setShowMenu(false);
                      }}
                    >
                      <LinkIcon size={18} style={{ marginRight: 8 }} />
                      Links
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        navigate("/admin/events");
                        setShowMenu(false);
                      }}
                    >
                      <Calendar size={18} style={{ marginRight: 8 }} />
                      My Events
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        setIsPreferencesOpen(true);
                        setShowMenu(false);
                      }}
                    >
                      <Sparkles size={18} style={{ marginRight: 8 }} />
                      Vibe
                    </div>
                    <div
                      className="profile-menu-item"
                      onClick={() => {
                        toggleTheme();
                        setShowMenu(false);
                      }}
                    >
                      {theme === "classic" ? (
                        <Sun size={18} style={{ marginRight: 8 }} />
                      ) : (
                        <Moon size={18} style={{ marginRight: 8 }} />
                      )}
                      {theme === "classic" ? "Light Mode" : "Dark Mode"}
                    </div>
                    <div className="profile-menu-divider" />
                    <div
                      className="profile-menu-item profile-menu-item-danger"
                      onClick={() => {
                        handleLogout();
                        setShowMenu(false);
                      }}
                    >
                      <LogOut size={18} style={{ marginRight: 8 }} />
                      Logout
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => shareProfile(userId || "")}
              className="share-button-profile"
              title="Share Profile"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {isOwnProfile ? (
          <>
            <div
              className="header-image-container profile-header-editable"
              onClick={() => createFileInput("header")}
            >
              <img
                src={headerImage}
                alt="Header"
                className="profile-header-image"
              />
              {isImageUploading && (
                <div className="upload-overlay">Uploading...</div>
              )}
            </div>
            <div
              className="profile-bubble-container profile-image-editable"
              onClick={() => createFileInput("profile")}
            >
              <ProfileBubble
                profileId={userId || ""}
                profileImageUrl={profileImage}
                size="medium"
              />
              {isImageUploading && (
                <div className="upload-overlay">Uploading...</div>
              )}
            </div>
            <div className="profile-own-settings">
            <LevelSection points={points} />
          </div>
            
          </>
        ) : (
          <>
            <ProfileHeader
              headerImageUrl={user.headerImageUrl || defaultProfileImage}
              username={user.username}
            />
            
            <div
              className="profile-bubble-container"
              onClick={(e) => {
                e.preventDefault();
                navigate(`/profile/${userId}`);
              }}
            >
              <ProfileBubble
                profileId={userId || ""}
                profileImageUrl={user.profileImageUrl || ""}
                size="medium"
              />
            </div>
          </>
        )}
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
  
              {!isOwnProfile && (
                <ActionComponent
                  isFollowingWIP={isFollowing}
                  onFollow={handleFollow}
                  onMessage={handleMessage}
                />
              )}
            </div>
          </div>
        </div>
        
   

        {/* Profile Edit Modal */}
        {isOwnProfile && activeSection && (
          <div className="profile-edit-modal-overlay" onClick={() => setActiveSection(null)}>
            <div className="profile-edit-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="profile-edit-modal-header">
                <h2 className="profile-edit-modal-title">
                  {activeSection === "username" && "Edit Username"}
                  {activeSection === "email" && "Edit Email"}
                  {activeSection === "bio" && "Edit Bio"}
                  {activeSection === "links" && "Edit Links"}
                </h2>
                <button
                  className="profile-edit-modal-close"
                  onClick={() => setActiveSection(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="profile-info">
                {activeSection === "username" && (
                  <div className="profile-info-item">
                    <div className="info-label">Username</div>
                    <input
                      className="info-value"
                      type="text"
                      placeholder={user.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  </div>
                )}
                {activeSection === "email" && (
                  <div className="profile-info-item">
                    <div className="info-label">Email</div>
                    <input
                      className="info-value"
                      type="email"
                      placeholder={user.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                )}
                {activeSection === "bio" && (
                  <div className="profile-info-item">
                    <div className="profile-info-item-header">
                      <div className="info-label">Bio</div>
                      <button
                        type="button"
                        onClick={handleGenerateMagicBio}
                        disabled={isGeneratingMagicBio}
                        className="magic-bio-button-profile"
                        title="Generate AI-optimized bio"
                      >
                        <Sparkles size={16} />
                        {isGeneratingMagicBio ? "Generating..." : "Magic Bio"}
                      </button>
                    </div>
                    <textarea
                      className="info-value"
                      placeholder={user.bio}
                      value={changedFields.bio !== undefined ? changedFields.bio : (user?.bio || "")}
                      onChange={(e) => handleChange("bio", e.target.value)}
                    />
                  </div>
                )}
                {activeSection === "links" && (
                  <div className="profile-info-item">
                    <div className="info-label">Links</div>
                    <input
                      className="info-value"
                      type="text"
                      placeholder={user.links?.join(", ") || "separate links by comma"}
                      onChange={(e) => handleChangeLinks("links", e.target.value)}
                    />
                  </div>
                )}
                <button className="update-button" onClick={handleUpdate}>
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="user-events-section">
          {/* <ProfileFeed profileId={userId || ""} /> */}
          {/* <h2 className="events-title">Events by {user.username}</h2> */}
          <EventGalleryIII
            events={events}
            title={`${user.username}'s Events`}
            showEditIcon={isOwnProfile}
            onEditClick={handleEditEvent}
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
