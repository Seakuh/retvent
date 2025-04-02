import { motion } from "framer-motion";
import { useState } from "react";
import { UserPreferences, userPreferencesTemplate } from "../../../../utils";

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

  const handleSelection = (
    category: string,
    subcategory: string,
    value: string
  ) => {
    setSelectedPreferences((prev) => {
      const newPreferences = { ...prev };

      switch (category) {
        case "EventArt":
          newPreferences.eventTypes = newPreferences.eventTypes || [];
          if (newPreferences.eventTypes.includes(value)) {
            newPreferences.eventTypes = newPreferences.eventTypes.filter(
              (t) => t !== value
            );
          } else {
            newPreferences.eventTypes.push(value);
          }
          break;
        case "GenreStil":
          newPreferences.genreStyles = newPreferences.genreStyles || [];
          if (newPreferences.genreStyles.includes(value)) {
            newPreferences.genreStyles = newPreferences.genreStyles.filter(
              (g) => g !== value
            );
          } else {
            newPreferences.genreStyles.push(value);
          }
          break;
        case "TargetAudienceContext":
          newPreferences.context = newPreferences.context || {};
          newPreferences.context[
            subcategory.toLowerCase() as keyof typeof newPreferences.context
          ] =
            newPreferences.context[
              subcategory.toLowerCase() as keyof typeof newPreferences.context
            ] || [];
          const contextArray = newPreferences.context[
            subcategory.toLowerCase() as keyof typeof newPreferences.context
          ] as string[];
          if (contextArray.includes(value)) {
            newPreferences.context[
              subcategory.toLowerCase() as keyof typeof newPreferences.context
            ] = contextArray.filter((c) => c !== value);
          } else {
            contextArray.push(value);
          }
      }
      return newPreferences;
    });
  };

  return (
    <div className="embedding-preferences-container max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-6">
          {userPreferencesTemplate.categories.map((cat, index) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(index)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeCategory === index
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
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
          className="grid gap-6"
        >
          {Object.entries(
            userPreferencesTemplate.categories[activeCategory].values
          ).map(([category, values]) => (
            <div key={category} className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
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
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      isSelected(
                        selectedPreferences,
                        userPreferencesTemplate.categories[activeCategory].name,
                        category,
                        value
                      )
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
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
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Save
      </button>
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
    case "EventArt":
      return preferences.eventTypes?.includes(value) || false;
    case "GenreStil":
      return preferences.genreStyles?.includes(value) || false;
    case "TargetAudienceContext":
      return (
        preferences.context?.[
          subcategory.toLowerCase() as keyof typeof preferences.context
        ]?.includes(value) || false
      );
    default:
      return false;
  }
};
