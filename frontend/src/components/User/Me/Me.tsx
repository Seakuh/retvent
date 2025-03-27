import { useEffect, useState } from "react";
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

  const userLevel = calculateUserLevel(me?.points || 0);
  const progress = calculateProgress(me?.points || 0, userLevel);
  const nextLevel = USER_LEVELS.find((level) => level.level > userLevel.level);

  useEffect(() => {
    const fetchMe = async () => {
      if (!user.id) return;
      try {
        setIsLoading(true);
        const profile = await meService.getMe(user.id);
        setMe(profile);
      } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [user.id]);

  const handleChange = (field: keyof Profile, value: string) => {
    if (!me) return;
    setMe({ ...me, [field]: value });
  };

  const handleUpdate = async () => {
    if (!me || !user.id) return;
    try {
      setIsUpdating(true);
      const updatedProfile = await meService.updateProfile(user.id, me);
      setMe(updatedProfile);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Profils:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="me-container">Laden...</div>;
  }

  if (!me) {
    return <div className="me-container">Profil nicht gefunden</div>;
  }

  const changeHeaderImage = () => {
    console.log("Header image clicked");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "header");
        try {
          const response = await meService.updateHeaderImage(user.id, formData);
          if (response.success) {
            setMe({ ...me, headerImageUrl: response.url });
          }
        } catch (error) {
          console.error("Fehler beim Aktualisieren des Headers:", error);
        } finally {
          fileInput.remove();
        }
      }
      fileInput.click();
    };
  };

  const changeProfileImage = () => {
    console.log("Profile image clicked");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "header");
        try {
          const response = await meService.updateProfileImage(
            user.id,
            formData
          );
          if (response.success) {
            setMe({ ...me, headerImageUrl: response.url });
          }
        } catch (error) {
          console.error("Fehler beim Aktualisieren des Headers:", error);
        } finally {
          fileInput.remove();
        }
      }
      fileInput.click();
    };
  };

  return (
    <div>
      <div className="me-container">
        <div className="header-section" onClick={changeHeaderImage}>
          <img
            src={me.headerImageUrl || fallBackProfileImage}
            alt="Header"
            className="header-image"
          />
          <div className="header-overlay" />
          <div className="profile-image-container" onClick={changeProfileImage}>
            <img
              src={me.profileImageUrl || fallBackProfileImage}
              alt="Profil"
              className="profile-image"
            />
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
                {nextLevel && <span>next Level: {nextLevel.minPoints}</span>}
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
                <span>next Level: {nextLevel.name}</span>
                <span>→</span>
              </div>
            )}
          </div>

          <div className="profile-info">
            {[
              ["Username", "username"],
              ["E-Mail", "email"],
              ["Bio", "bio"],
            ].map(([label, field]) => (
              <div className="info-group" key={field}>
                <div className="info-label">{label}</div>
                <input
                  className="info-value"
                  type="text"
                  value={me[field as keyof Profile] || ""}
                  onChange={(e) =>
                    handleChange(field as keyof Profile, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button
            className="update-button"
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </div>
      {/* <EventGalleryII
        events={}
        title="Uploaded Events"
        showTitle={false}
      /> */}
    </div>
  );
};
