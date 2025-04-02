import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { UserPreferences, userPreferencesTemplate } from "../../../../utils";
import "./EmbeddingPreferences.css";

interface EmbeddingPreferencesProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onClose?: () => void;
}

export const EmbeddingPreferences = ({
  preferences,
  onSave,
  onClose,
}: EmbeddingPreferencesProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedPreferences, setSelectedPreferences] =
    useState<UserPreferences>({
      eventTypes: preferences?.eventTypes || [],
      genreStyles: preferences?.genreStyles || [],
      targetAudience: preferences?.targetAudience || [],
      communityOffers: preferences?.communityOffers || [],
    });

  useEffect(() => {
    console.log("Current preferences:", selectedPreferences);
  }, [selectedPreferences]);

  const handleSelection = (
    category: string,
    subcategory: string,
    value: string
  ) => {
    setSelectedPreferences((prev) => {
      const newPreferences = JSON.parse(
        JSON.stringify(prev)
      ) as UserPreferences;

      switch (category) {
        case "Event Type":
          newPreferences.eventTypes = newPreferences.eventTypes || [];

          if (newPreferences.eventTypes.includes(value)) {
            newPreferences.eventTypes = newPreferences.eventTypes.filter(
              (t) => t !== value
            );
          } else {
            newPreferences.eventTypes = [...newPreferences.eventTypes, value];
          }
          break;

        case "Genre/Style":
          newPreferences.genreStyles = newPreferences.genreStyles || [];

          if (newPreferences.genreStyles.includes(value)) {
            newPreferences.genreStyles = newPreferences.genreStyles.filter(
              (g) => g !== value
            );
          } else {
            newPreferences.genreStyles = [...newPreferences.genreStyles, value];
          }
          break;

        case "Target Audience/Context":
          newPreferences.targetAudience = newPreferences.targetAudience || [];

          if (newPreferences.targetAudience.includes(value)) {
            newPreferences.targetAudience =
              newPreferences.targetAudience.filter((t) => t !== value);
          } else {
            newPreferences.targetAudience = [
              ...(newPreferences.targetAudience || []),
              value,
            ];
          }
          break;
      }

      console.log("Updated preferences:", newPreferences);
      return newPreferences;
    });
  };

  return (
    <div className="preferences-overlay">
      <div className="preferences-container">
        <div className="preferences-header">
          <h2 className="preferences-title">Customize Your Experience</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          )}
        </div>

        <div className="preferences-content">
          <div className="category-tabs">
            {userPreferencesTemplate.categories.map((cat, index) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(index)}
                className={`category-tab ${
                  activeCategory === index ? "active" : ""
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={activeCategory}
            className="selection-grid"
          >
            {Object.entries(
              userPreferencesTemplate.categories[activeCategory].values
            ).map(([category, values]) => (
              <div key={category} className="category-card">
                <h3 className="category-title">{category}</h3>
                <div className="options-grid">
                  {values.map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        handleSelection(
                          userPreferencesTemplate.categories[activeCategory]
                            .name,
                          category,
                          value
                        )
                      }
                      className={`option-chip ${
                        isSelected(
                          selectedPreferences,
                          userPreferencesTemplate.categories[activeCategory]
                            .name,
                          category,
                          value
                        )
                          ? "selected"
                          : ""
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <button
          onClick={() => onSave(selectedPreferences)}
          className="save-button"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

const isSelected = (
  preferences: UserPreferences,
  category: string,
  subcategory: string,
  value: string
): boolean => {
  if (!preferences) return false;

  switch (category) {
    case "Event Type":
      return (
        Array.isArray(preferences.eventTypes) &&
        preferences.eventTypes.includes(value)
      );
    case "Genre/Style":
      return (
        Array.isArray(preferences.genreStyles) &&
        preferences.genreStyles.includes(value)
      );
    case "Target Audience/Context":
      return (
        Array.isArray(preferences.targetAudience) &&
        preferences.targetAudience.includes(value)
      );
    default:
      return false;
  }
};
