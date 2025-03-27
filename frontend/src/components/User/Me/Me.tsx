import { useCallback, useEffect, useState } from "react";
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
  const navigate = useNavigate();

  // Zustandsverwaltung
  const [me, setMe] = useState<Profile>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changedFields, setChangedFields] = useState<Partial<Profile>>({});
  const [points, setPoints] = useState<number>(0);
  const [headerImage, setHeaderImage] = useState<string>(fallBackProfileImage);
  const [profileImage, setProfileImage] =
    useState<string>(fallBackProfileImage);

  // Abgeleitete Werte
  const userLevel = calculateUserLevel(me?.points || 0);
  const progress = calculateProgress(me?.points || 0, userLevel);
  const nextLevel = USER_LEVELS.find((level) => level.level > userLevel.level);

  // Daten-Fetching
  const fetchProfileData = useCallback(async () => {
    if (!user.id) return;
    try {
      setIsLoading(true);
      const profile = await meService.getMe(user.id);
      setMe((prev) =>
        JSON.stringify(prev) !== JSON.stringify(profile) ? profile : prev
      );
      setPoints((prev) => (prev !== profile.points ? profile.points : prev));
      setHeaderImage((prev) =>
        prev !== (profile.headerImageUrl || fallBackProfileImage)
          ? profile.headerImageUrl || fallBackProfileImage
          : prev
      );
      setProfileImage((prev) =>
        prev !== (profile.profileImageUrl || fallBackProfileImage)
          ? profile.profileImageUrl || fallBackProfileImage
          : prev
      );
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Event Handler
  const handleChange = useCallback(
    (field: keyof Profile, value: string) => {
      if (!me) return;
      setChangedFields((prev) => ({ ...prev, [field]: value }));
    },
    [me]
  );

  const handleUpdate = useCallback(async () => {
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
      console.error("Fehler beim Aktualisieren des Profils:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [me, user.id, changedFields]);

  const handleImageUpload = useCallback(
    async (type: "header" | "profile", file: File) => {
      if (!user.id) return;

      try {
        const response =
          type === "header"
            ? await meService.updateHeaderImage(user.id, file)
            : await meService.updateProfileImage(user.id, file);

        if (response.ok) {
          const data = await response.json();
          const imageUrl =
            type === "header" ? data.headerImageUrl : data.profileImageUrl;

          if (type === "header") {
            setHeaderImage(imageUrl);
          } else {
            setProfileImage(imageUrl);
          }

          setMe((prev) =>
            prev ? { ...prev, [`${type}ImageUrl`]: imageUrl } : undefined
          );
        } else {
          throw new Error(`Fehler beim Aktualisieren des ${type}-Bildes`);
        }
      } catch (error) {
        console.error(`Fehler beim Aktualisieren des ${type}-Bildes:`, error);
      }
    },
    [user.id]
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

  // Hilfsfunktionen
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Loading und Error States
  if (isLoading) {
    return <div className="me-container">Laden...</div>;
  }

  if (!me) {
    return <div className="me-container">Profile not found</div>;
  }

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
                <span>{points || 0} Points</span>
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
          <button
            className="preview-button"
            onClick={() => navigate(`/profile/${me.id}`)}
          >
            View Profile
          </button>
          <div className="profile-info">
            <div className="profile-info-item">
              <div className="info-label">Username</div>
              <input
                className="info-value"
                type="text"
                placeholder={me.username}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
            <div className="profile-info-item">
              <div className="info-label">Email</div>
              <input
                className="info-value"
                type="email"
                placeholder={me.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="profile-info-item">
              <div className="info-label">Bio</div>
              <textarea
                className="info-value"
                placeholder={me.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
              />
            </div>
            <div className="profile-info-item">
              <div className="info-label">Links</div>
              <input
                className="info-value"
                type="text"
                placeholder={me.links?.join(", ")}
                onChange={(e) => handleChange("links", e.target.value)}
              />
            </div>
          </div>

          <button className="update-button" onClick={handleUpdate}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
        <div className="member-since">
          Member since {formatDate(new Date(me.createdAt))}
        </div>
      </div>
    </div>
  );
};
