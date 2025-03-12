import React from 'react';
import styles from './GenreSlider.module.css';

const GenreSlider: React.FC = () => {
  const genres = [
    'Techno', 'House', 'Deep House', 'Progressive', 
    'Melodic Techno', 'Minimal', 'Tech House', 'Tribal',
    'Organic House', 'Afro House', 'Electronic', 'Dance'
  ];

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