import { useEffect, useState } from "react";
import type { Profile } from "../../../utils";
import {
  calculateProgress,
  calculateUserLevel,
  USER_LEVELS,
} from "../../../utils";
import "./Me.css";
import { meService } from "./service";

export const Me: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [me, setMe] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const userLevel = calculateUserLevel(me.points || 0);
  const progress = calculateProgress(me.points || 0, userLevel);
  const nextLevel = USER_LEVELS.find((level) => level.level > userLevel.level);

  return (
    <div className="me-container">
      <div className="header-section">
        <img
          src={me.headerImageUrl || "/default-header.jpg"}
          alt="Header"
          className="header-image"
        />
        <div className="header-overlay" />
        <div className="profile-image-container">
          <img
            src={me.profileImageUrl || "/default-avatar.jpg"}
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
              <span>{me.points || 0} Punkte</span>
              {nextLevel && <span>Nächstes Level: {nextLevel.minPoints}</span>}
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
              <span>Nächstes Level: {nextLevel.name}</span>
              <span>→</span>
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-group">
            <div className="info-label">Benutzername</div>
            <div className="info-value">{me.username}</div>
          </div>
          <div className="info-group">
            <div className="info-label">E-Mail</div>
            <div className="info-value">{me.email}</div>
          </div>
          {me.bio && (
            <div className="info-group">
              <div className="info-label">Bio</div>
              <div className="info-value">{me.bio}</div>
            </div>
          )}
          {me.category && (
            <div className="info-group">
              <div className="info-label">Kategorie</div>
              <div className="info-value">{me.category}</div>
            </div>
          )}
          <div className="info-group">
            <div className="info-label">Follower</div>
            <div className="info-value">{me.followerCount || 0}</div>
          </div>
          {me.doorPolicy && (
            <div className="info-group">
              <div className="info-label">Door Policy</div>
              <div className="info-value">{me.doorPolicy}</div>
            </div>
          )}
          {me.queue && (
            <div className="info-group">
              <div className="info-label">Queue</div>
              <div className="info-value">{me.queue}</div>
            </div>
          )}
        </div>

        <button
          className="update-button"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? "Wird aktualisiert..." : "Profil aktualisieren"}
        </button>
      </div>
    </div>
  );
};
