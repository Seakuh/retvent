import { Locate } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import styles from "./LocationOverlay.module.css";

export const LocationOverlay = () => {
  const { setLocation } = useContext(UserContext);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Locate className={styles.emoji} />
        <h2 className={styles.title}>Enable Location Services</h2>
        <p className={styles.description}>
          We need your location to show you the best events nearby!
        </p>
        <button className={styles.button} onClick={handleGetLocation}>
          Share Location
        </button>
      </div>
    </div>
  );
};
