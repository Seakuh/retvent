import { ChevronLeft } from "lucide-react";
import { useCallback, useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import type { Profile, UserPreferences } from "../../../utils";
import {
  calculateProgress,
  calculateUserLevel,
  defaultUserPreferences,
  fallBackProfileImage,
  handleLogout,
  USER_LEVELS,
} from "../../../utils";
import { EmbeddingPreferences } from "../../EventDetail/components/EmbeddingPreferences/EmbeddingPreferences";
import { LevelSection } from "../../LevelSection/LevelSection";
import "./Me.css";
import { meService } from "./service";
export const Me: React.FC = () => {
  const navigate = useNavigate();

  // Zustandsverwaltung
  const [me, setMe] = useState<Profile>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changedFields, setChangedFields] = useState<Partial<Profile>>({});
  const { user, setUser } = useContext(UserContext);
  const [points, setPoints] = useState<number>(0);
  const [headerImage, setHeaderImage] = useState<string>(fallBackProfileImage);
  const [profileImage, setProfileImage] =
    useState<string>(fallBackProfileImage);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(
    defaultUserPreferences
  );
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [solanaWalletAddress, setSolanaWalletAddress] = useState<string>(
    localStorage.getItem("solanaWalletAddress") || ""
  );
  const [solanaWalletPrivateKey, setSolanaWalletPrivateKey] = useState<string>(
    localStorage.getItem("solanaWalletPrivateKey") || ""
  );

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
      setUser({
        ...user,
        ...profile,
      });
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

  const handleChangeLinks = useCallback(
    // split the value by comma and remove whitespace
    (field: keyof Profile, value: string) => {
      if (!me) return;
      const links = value.split(",").map((link) => link.trim());
      setChangedFields((prev) => ({ ...prev, [field]: links }));
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
      setUser((prev) => (prev ? { ...prev, ...updatedProfile } : undefined));
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
        setIsImageUploading(true);
        const response =
          type === "header"
            ? await meService.updateHeaderImage(user.id, file)
            : await meService.updateProfileImage(user.id, file);

        if (!response.ok) {
          throw new Error(`Fehler beim Aktualisieren des ${type}-Bildes`);
        }

        const data = await response.json();
        const imageUrl =
          type === "header" ? data.headerImageUrl : data.profileImageUrl;

        // Aktualisiere die States erst nach erfolgreicher Verarbeitung
        if (type === "header") {
          setHeaderImage(imageUrl);
        } else {
          setProfileImage(imageUrl);
        }

        setMe((prev) =>
          prev ? { ...prev, [`${type}ImageUrl`]: imageUrl } : undefined
        );
      } catch (error) {
        console.error(`Fehler beim Aktualisieren des ${type}-Bildes:`, error);
        // Bei einem Fehler behalten wir die alten Bilder bei
      } finally {
        setIsImageUploading(false);
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

  const savePreferences = useCallback(
    (preferences: UserPreferences) => {
      setPreferences(preferences);
      meService.updatePreferences(user.id, preferences);
      localStorage.setItem("preferences", JSON.stringify(preferences));
      setIsPreferencesOpen(false);
    },
    [user.id]
  );

  const loadPreferences = useCallback(async () => {
    const localPreferences = localStorage.getItem("preferences");
    if (localPreferences) {
      return JSON.parse(localPreferences);
    } else {
      const preferences = await meService.getPreferences(user.id);
      return preferences;
    }
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      if (!user.id) return;

      try {
        const preferences = await loadPreferences();
        if (isMounted) {
          setPreferences(preferences);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    fetchPreferences();

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  // Hilfsfunktionen
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

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

  // Loading und Error States
  if (isLoading) {
    return <div className="me-container">Laden...</div>;
  }

  if (!me) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      {isPreferencesOpen && (
        <EmbeddingPreferences
          preferences={preferences}
          onSave={savePreferences}
          onClose={() => setIsPreferencesOpen(false)}
        />
      )}
      <button className="back-button" onClick={handleBack}>
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <div className="me-container">
        <div className="header-section">
          <div
            className="header-image-container"
            onClick={() => createFileInput("header")}
          >
            <img src={headerImage} alt="Header" className="header-image" />
            {isImageUploading && (
              <div className="upload-overlay">Uploading...</div>
            )}
          </div>
          <div className="header-overlay" />
          <div
            className="profile-image-container"
            onClick={() => createFileInput("profile")}
          >
            <img src={profileImage} alt="Profile" className="profile-image" />
            {isImageUploading && (
              <div className="upload-overlay">Uploading...</div>
            )}
          </div>
        </div>

        <div className="content-section">
          <LevelSection points={points} />
          <button
            className="preferences-button"
            onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
          >
            Preferences
          </button>
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
                placeholder={me.links?.join(", ") || "seperate links by comma"}
                onChange={(e) => handleChangeLinks("links", e.target.value)}
              />
            </div>
          </div>

          <button className="update-button" onClick={handleUpdate}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="member-since">
          Member since {formatDate(new Date(me.createdAt))}
        </div>
        <div className="solana-wallet-section">
          <div className="solana-wallet-section-header">
            <span className="solana-wallet-section-header-text">
              Solana Wallet
            </span>
            <span className="solana-wallet-section-header-emoji">💰</span>
          </div>
          <div
            className="solana-wallet-address"
            onClick={() => {
              navigator.clipboard.writeText(solanaWalletAddress);
              const hint = document.createElement("div");
              hint.textContent = "Copied!";
              hint.style.position = "fixed";
              hint.style.padding = "8px";
              hint.style.background = "rgba(0,0,0,0.8)";
              hint.style.color = "white";
              hint.style.borderRadius = "4px";
              hint.style.zIndex = "1000";
              document.body.appendChild(hint);
              const rect = event.target.getBoundingClientRect();
              hint.style.top = `${rect.bottom + 5}px`;
              hint.style.left = `${rect.left}px`;
              setTimeout(() => hint.remove(), 2000);
            }}
          >
            Solana Wallet Address:
            {solanaWalletAddress}
          </div>
          <div
            className="solana-wallet-private-key"
            onClick={() => {
              navigator.clipboard.writeText(solanaWalletPrivateKey);
              const hint = document.createElement("div");
              hint.textContent = "Copied!";
              hint.style.position = "fixed";
              hint.style.padding = "8px";
              hint.style.background = "rgba(0,0,0,0.8)";
              hint.style.color = "white";
              hint.style.borderRadius = "4px";
              hint.style.zIndex = "1000";
              document.body.appendChild(hint);
              const rect = event.target.getBoundingClientRect();
              hint.style.top = `${rect.bottom + 5}px`;
              hint.style.left = `${rect.left}px`;
              setTimeout(() => hint.remove(), 2000);
            }}
          >
            Solana Wallet Private Key: {solanaWalletPrivateKey}
          </div>
        </div>
      </div>
    </div>
  );
};
