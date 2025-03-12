import React from "react";
import styles from "./GenreSlider.module.css";

export interface GenreSliderProps {
  genres: string[];
}

const GenreSlider: React.FC<GenreSliderProps> = ({ genres }) => {
  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        <div className={styles.track}>
          {[...genres, ...genres].map((genre, index) => (
            <span key={index} className={styles.genre}>
              {genre}
              <span className={styles.separator}>●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreSlider;
