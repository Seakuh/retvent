import React from "react";
import styles from "./TagSlider.module.css";

export interface TagsProps {
  tags: string[];
}

export const Tags: React.FC<TagsProps> = ({ tags }) => {
  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        <div className={styles.track}>
          {[...tags, ...tags].map((tag, index) => (
            <span key={index} className={styles.tag}>
              {tag}
              <span className={styles.separator}>●</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tags;
