import { motion } from "framer-motion";
import { useState } from "react";
import { UserPreferences, userPreferencesTemplate } from "../../../../utils";
import "./EmbeddingPreferences.css";

interface EmbeddingPreferencesProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

export const EmbeddingPreferences = ({
  preferences,
  onSave,
}: EmbeddingPreferencesProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedPreferences, setSelectedPreferences] =
    useState<UserPreferences>(preferences);

  const getSelectionCount = (category: string, subcategory: string): number => {
    switch (category) {
      case "Event Type":
        return selectedPreferences.eventTypes?.length || 0;
      case "Genre/Style":
        return selectedPreferences.genreStyles?.length || 0;
      case "Target Audience/Context":
        const contextKey = subcategory
          .toLowerCase()
          .replace(/ /g, "") as keyof typeof selectedPreferences.context;
        return selectedPreferences.context?.[contextKey]?.length || 0;
      default:
        return 0;
    }
  };

  const handleSelection = (
    category: string,
    subcategory: string,
    value: string
  ) => {
    setSelectedPreferences((prev) => {
      const newPreferences = { ...prev };

      switch (category) {
        case "Event Type":
          newPreferences.eventTypes = newPreferences.eventTypes || [];
          if (newPreferences.eventTypes.includes(value)) {
            newPreferences.eventTypes = newPreferences.eventTypes.filter(
              (t) => t !== value
            );
          } else {
            newPreferences.eventTypes.push(value);
          }
          break;
        case "Genre/Style":
          newPreferences.genreStyles = newPreferences.genreStyles || [];
          if (newPreferences.genreStyles.includes(value)) {
            newPreferences.genreStyles = newPreferences.genreStyles.filter(
              (g) => g !== value
            );
          } else {
            newPreferences.genreStyles.push(value);
          }
          break;
        case "Target Audience/Context":
          newPreferences.context = newPreferences.context || {};
          const contextKey = subcategory
            .toLowerCase()
            .replace(/ /g, "") as keyof typeof newPreferences.context;
          newPreferences.context[contextKey] =
            newPreferences.context[contextKey] || [];
          const contextArray = newPreferences.context[contextKey] as string[];
          if (contextArray.includes(value)) {
            newPreferences.context[contextKey] = contextArray.filter(
              (c) => c !== value
            );
          } else {
            contextArray.push(value);
          }
      }
      return newPreferences;
    });
  };

  return (
    <div className="preferences-container">
      <div className="preferences-content">
        <h2 className="preferences-title">Customize Your Experience</h2>
        <p className="preferences-subtitle">
          Select multiple options that match your interests
        </p>

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeCategory}
          className="selection-grid"
        >
          {Object.entries(
            userPreferencesTemplate.categories[activeCategory].values
          ).map(([category, values]) => (
            <div key={category} className="category-card">
              <div className="category-header">
                <h3 className="category-title">{category}</h3>
                <span className="selection-count">
                  {getSelectionCount(
                    userPreferencesTemplate.categories[activeCategory].name,
                    category
                  )}
                  selected
                </span>
              </div>
              <div className="options-grid">
                {values.map((value) => (
                  <button
                    key={value}
                    onClick={() =>
                      handleSelection(
                        userPreferencesTemplate.categories[activeCategory].name,
                        category,
                        value
                      )
                    }
                    className={`option-chip ${
                      isSelected(
                        selectedPreferences,
                        userPreferencesTemplate.categories[activeCategory].name,
                        category,
                        value
                      )
                        ? "selected"
                        : ""
                    }`}
                  >
                    <span className="option-text">{value}</span>
                    <span className="selection-indicator"></span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

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

// Hilfsfunktion um zu prüfen, ob ein Wert ausgewählt ist
const isSelected = (
  preferences: UserPreferences,
  category: string,
  subcategory: string,
  value: string
): boolean => {
  switch (category) {
    case "Event Type":
      return preferences.eventTypes?.includes(value) || false;
    case "Genre/Style":
      return preferences.genreStyles?.includes(value) || false;
    case "Target Audience/Context":
      const contextKey = subcategory
        .toLowerCase()
        .replace(/ /g, "") as keyof typeof preferences.context;
      return preferences.context?.[contextKey]?.includes(value) || false;
    default:
      return false;
  }
};
