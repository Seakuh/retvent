import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Profile } from "../../../utils";
import {
  calculateProgress,
  calculateUserLevel,
  fallBackProfileImage,
  USER_LEVELS,
} from "../../../utils";
import "./Me.css";
import { meService } from "./service";

export const Me: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [me, setMe] = useState<Profile>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changedFields, setChangedFields] = useState<Partial<Profile>>({});
  const navigate = useNavigate();
  const userLevel = calculateUserLevel(me?.points || 0);
  const progress = calculateProgress(me?.points || 0, userLevel);
  const nextLevel = USER_LEVELS.find((level) => level.level > userLevel.level);
  const [headerImage, setHeaderImage] = useState<string>(
    me?.headerImageUrl || fallBackProfileImage
  );
  const [profileImage, setProfileImage] = useState<string>(
    me?.profileImageUrl || fallBackProfileImage
  );

  useEffect(() => {
    const fetchMe = async () => {
      if (!user.id) return;
      try {
        setIsLoading(true);
        const profile = await meService.getMe(user.id);
        setMe(profile);
        setHeaderImage(profile.headerImageUrl || fallBackProfileImage);
        setProfileImage(profile.profileImageUrl || fallBackProfileImage);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [user.id]);

  const handleChange = (field: keyof Profile, value: string) => {
    if (!me) return;
    setChangedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!me || !user.id || Object.keys(changedFields).length === 0) return;
    try {
      setIsUpdating(true);
      const updatedProfile = await meService.updateProfile(
        user.id,
        changedFields
      );
      setMe((prev) => (prev ? { ...prev, ...updatedProfile } : undefined));
      setChangedFields({});
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (type: "header" | "profile", file: File) => {
    if (!user.id) return;

    try {
      const response =
        type === "header"
          ? await meService.updateHeaderImage(user.id, file)
          : await meService.updateProfileImage(user.id, file);

      if (response.ok) {
        const data = await response.json();
        if (type === "header") {
          setHeaderImage(data.headerImageUrl);
          setMe((prev) =>
            prev ? { ...prev, headerImageUrl: data.headerImageUrl } : undefined
          );
        } else {
          setProfileImage(data.profileImageUrl);
          setMe((prev) =>
            prev
              ? { ...prev, profileImageUrl: data.profileImageUrl }
              : undefined
          );
        }
      } else {
        throw new Error(`Failed to update ${type} image`);
      }
    } catch (error) {
      console.error(
        `Error updating ${type === "header" ? "header" : "profile"} image:`,
        error
      );
    }
  };

  const createFileInput = (type: "header" | "profile") => {
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
  };

  if (isLoading) {
    return <div className="me-container">Loading...</div>;
  }

  if (!me) {
    return <div className="me-container">Profile not found</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const profileFields: Array<{
    label: string;
    field: keyof Profile;
    type?: string;
  }> = [
    { label: "Username", field: "username" },
    { label: "Email", field: "email" },
    { label: "Bio", field: "bio" },
    { label: "Links", field: "links" },
  ];

  return (
    <div>
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
      <div className="me-container">
        <div className="header-section">
          <div
            className="header-image-container"
            onClick={() => createFileInput("header")}
          >
            <img src={headerImage} alt="Header" className="header-image" />
          </div>
          <div className="header-overlay" />
          <div
            className="profile-image-container"
            onClick={() => createFileInput("profile")}
          >
            <img src={profileImage} alt="Profile" className="profile-image" />
          </div>
        </div>

        <div className="content-section">
          <div
            className="level-section"
            style={{
              background: `linear-gradient(135deg, ${userLevel.color}20 0%, ${userLevel.color}40 100%)`,
            }}
          >
            <div className="level-header">
              <div>
                <div className="level-title">Level {userLevel.level}</div>
                <div className="level-name">{userLevel.name}</div>
                <div className="level-description">{userLevel.description}</div>
              </div>
              <div className="points-info">
                <span>{me.points || 0} Points</span>
                {nextLevel && <span>Next Level: {nextLevel.minPoints}</span>}
              </div>
            </div>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${userLevel.color} 0%, ${userLevel.color}80 100%)`,
                }}
              />
            </div>

            {nextLevel && (
              <div className="next-level">
                <span>Next Level: {nextLevel.name}</span>
                <span>→</span>
              </div>
            )}
          </div>
          <div className="member-since">
            Member since {formatDate(me.createdAt)}
          </div>
          <div className="profile-info">
            {profileFields.map(({ label, field, type = "text" }) => (
              <div className="info-group" key={field}>
                <div className="info-label">{label}</div>
                <input
                  className="info-value"
                  type={type}
                  placeholder={me[field] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button
            className="preview-button"
            onClick={() => navigate(`/profile/${me.id}`)}
          >
            Preview
          </button>
          <button className="update-button" onClick={handleUpdate}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
