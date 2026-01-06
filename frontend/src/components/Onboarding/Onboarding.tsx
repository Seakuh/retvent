import React, { useState } from "react";
import { onboardingService, OnboardingPreferences } from "../../services/onboarding.service";
import "./Onboarding.css";

interface OnboardingProps {
  onComplete: (events?: any[]) => void;
  onSkip: () => void;
  onContinueClick?: () => void;
}

export interface UserPreferences {
  mainListening: string[];
  genres: string[];
  vibes: string[];
  technoSubgenres: string[];
  customTags: string[];
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip, onContinueClick }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    mainListening: [],
    genres: [],
    vibes: [],
    technoSubgenres: [],
    customTags: [],
  });
  const [searchQuery, setSearchQuery] = useState("");

  const mainListeningOptions = [
    "Electronic",
    "Live music",
    "Experimental",
    "Ambient / Chill",
    "Guitar-based",
    "Hip-hop / Beats",
    "Classical / Contemporary",
    "Spoken / Talks",
  ];

  const genreOptions = [
    "Techno",
    "House",
    "Indie",
    "Jazz",
    "Ambient",
    "Hip-Hop",
    "Pop",
    "Experimental",
    "Classical",
    "Punk",
    "Afro / Latin",
    "+ more",
  ];

  const vibeOptions = [
    "On weekends",
    "After work",
    "Calm",
    "Curious",
    "Energetic",
    "Intimate",
    "Late-night",
    "During the week",
    "Yoga sessions in relaxed atmosphere",
    "Networking opportunities",
    "Learning & workshops",
    "Outdoor events",
    "Small intimate gatherings",
    "Large crowds & festivals",
    "Underground vibes",
    "Art & exhibitions",
    "Food & drinks focused",
    "Dancing all night",
    "Seated listening sessions",
    "Daytime events",
  ];

  const technoSubgenres = {
    "Classic & Foundation": [
      "Detroit Techno",
      "Minimal Techno",
      "Dub Techno",
      "Deep Techno",
      "Raw Techno",
      "Hypnotic Techno",
      "Groove Techno",
    ],
    "⚙️ Harder / Darker / Industrial": [
      "Hard Techno",
      "Industrial Techno",
      "Dark Techno",
      "Schranz",
      "Acid Techno",
      "EBM Techno",
      "Noise Techno",
      "Post-Industrial Techno",
    ],
    "🌀 Experimental / Avant-garde": [
      "Experimental Techno",
      "Abstract Techno",
      "Leftfield Techno",
      "Deconstructed Techno",
      "Broken Techno",
      "Polyrhythmic Techno",
      "Glitch Techno",
    ],
    "🌫 Atmospheric / Hypnotic": [
      "Ambient Techno",
      "Deep Hypnotic Techno",
      "Ethereal Techno",
      "Cosmic Techno",
      "Drone Techno",
    ],
    "🔊 Rave / Peak-Time / Club": [
      "Peak Time Techno",
      "Rave Techno",
      "Festival Techno",
      "Warehouse Techno",
      "Big Room Techno",
    ],
    "🧪 Acid & Oldschool": [
      "Hard Acid",
      "303 Techno",
      "Oldschool Techno",
      "90s Techno",
      "Rave Techno (UK/90s)",
    ],
    "🌍 Regional / Scene-specific": [
      "Berlin Techno",
      "Dub Techno (Berlin/Basic Channel)",
      "UK Techno",
      "Birmingham Techno",
      "Japanese Techno",
      "Scandinavian Techno",
    ],
    "🔄 Hybrid & Crossover": [
      "Techno-Trance",
      "Techno-Electro",
      "Techno-Breaks",
      "Techno-IDM",
      "Techno-House",
      "Techno-EBM",
      "Techno-Ambient",
    ],
    "🧠 Intellectual / Listening-oriented": [
      "Intelligent Techno",
      "IDM-influenced Techno",
      "Cinematic Techno",
      "Conceptual Techno",
    ],
  };

  // Filter options based on search query
  const filterOptions = (options: string[]) => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.toLowerCase().includes(query)
    );
  };

  const filteredMainListening = filterOptions(mainListeningOptions);
  const filteredGenres = filterOptions(genreOptions);
  const filteredVibes = filterOptions(vibeOptions);

  // Filter Techno subgenres based on search
  const filteredTechnoSubgenres: { [key: string]: string[] } = {};
  if (preferences.genres.includes("Techno")) {
    Object.entries(technoSubgenres).forEach(([category, subgenres]) => {
      const filtered = filterOptions(subgenres);
      if (filtered.length > 0) {
        filteredTechnoSubgenres[category] = filtered;
      }
    });
  }

  const hasTechnoSubgenres = Object.keys(filteredTechnoSubgenres).length > 0;
  const hasResults = filteredMainListening.length > 0 || filteredGenres.length > 0 || filteredVibes.length > 0 || hasTechnoSubgenres;
  const totalSelections = preferences.mainListening.length + preferences.genres.length + preferences.vibes.length + preferences.technoSubgenres.length + preferences.customTags.length;

  // Calculate progress percentage (max at 10 selections = 100%)
  const progressPercentage = Math.min((totalSelections / 10) * 100, 100);

  const toggleSelection = (category: keyof UserPreferences, value: string) => {
    setPreferences((prev) => {
      const current = prev[category];
      const isSelected = current.includes(value);

      return {
        ...prev,
        [category]: isSelected
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const trimmedQuery = searchQuery.trim();

      // Check if it's not already in customTags
      if (!preferences.customTags.includes(trimmedQuery)) {
        setPreferences((prev) => ({
          ...prev,
          customTags: [...prev.customTags, trimmedQuery],
        }));
      }

      // Clear search
      setSearchQuery("");
    }
  };

  const handleContinue = async () => {
    // Call onContinueClick callback immediately when Continue is clicked
    if (onContinueClick) {
      onContinueClick();
    }
    try {
      // Transform frontend preferences to backend format
      const backendPreferences: OnboardingPreferences = {
        eventType: {
          selected: preferences.mainListening,
        },
        genreStyle: {
          selected: preferences.genres,
        },
        context: {
          selected: preferences.vibes,
        },
      };

      // Add techno subgenres to genreStyle if any are selected
      if (preferences.technoSubgenres.length > 0) {
        backendPreferences.genreStyle = {
          selected: [...preferences.genres, ...preferences.technoSubgenres],
        };
      }

      // Add custom tags to context
      if (preferences.customTags.length > 0) {
        backendPreferences.context = {
          selected: [...preferences.vibes, ...preferences.customTags],
        };
      }

      // Send to backend and get personalized events
      const response = await onboardingService.savePreferencesAndGetEvents(backendPreferences);

      // Mark as completed in localStorage
      onboardingService.markOnboardingComplete();

      // Call onComplete callback with events data
      onComplete(response.events);
    } catch (error) {
      console.error("Error saving onboarding preferences:", error);
      // Even if API fails, mark as completed and continue
      onboardingService.markOnboardingComplete();
      onComplete();
    }
  };

  const handleSkip = () => {
    // Mark as completed even when skipped
    onboardingService.markOnboardingComplete();
    onSkip();
  };

  return (
    <div className="onboarding-container">
      {/* Fixed Header with Search */}
      {/* <div className="onboarding-header">
        <div className="onboarding-search-container">
          <Search className="onboarding-search-icon" size={20} />
          <input
            type="text"
            className="onboarding-search-input"
            placeholder="Search or add your own (press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
        </div>
      </div> */}



      {/* Scrollable Content */}
      <div className="onboarding-content">
        {/* Custom Tags Section - Always at top */}
        {preferences.customTags.length > 0 && (
          <section className="onboarding-section custom-tags-section">
            <h2 className="onboarding-subheadline">Your custom preferences</h2>
            <div className="bubble-grid custom-tags-grid">
              {preferences.customTags.map((tag) => (
                <button
                  key={tag}
                  className="bubble custom-tag-bubble selected"
                  onClick={() => toggleSelection("customTags", tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* No Results Message */}
        {searchQuery && !hasResults && (
          <div className="no-results">
            <p>No matches for "{searchQuery}"</p>
            <p className="no-results-hint">Press Enter to add it as a custom preference</p>
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          </div>
        )}


        {/* Section 3 - Optional Vibe Refinement */}
        {filteredVibes.length > 0 && (
          <section className="onboarding-section">
          <h1 className="onboarding-headline">How do you want to experience?</h1>
          <p className="onboarding-helper">
            helps to understand your context
          </p>
          <div className="bubble-grid vibe-grid">
            {filteredVibes.map((option) => (
              <button
                key={option}
                className={`bubble vibe-bubble ${
                  preferences.vibes.includes(option) ? "selected" : ""
                }`}
                onClick={() => toggleSelection("vibes", option)}
              >
                {option}
              </button>
            ))}
          </div>
          </section>
        )}

        {/* Section 1 - Main Question */}
        {filteredMainListening.length > 0 && (
          <section className="onboarding-section">
            <h1 className="onboarding-headline">What do you want to hear?</h1>
            <p className="onboarding-helper">
              Just pick what feels closest — you can change this anytime.
            </p>
            <div className="bubble-grid main-listening">
              {filteredMainListening.map((option) => (
              <button
                key={option}
                className={`bubble ${
                  preferences.mainListening.includes(option) ? "selected" : ""
                }`}
                onClick={() => toggleSelection("mainListening", option)}
              >
                {option}
              </button>
              ))}
            </div>
          </section>
        )}

        {/* Section 2 - Genre Focus */}
        {filteredGenres.length > 0 && (
          <section className="onboarding-section">
          <h1 className="onboarding-headline">
            Any genres you come back to?
          </h1>
          <p className="onboarding-helper">
            Select specific genres you enjoy
          </p>
          <div className="bubble-grid genre-grid">
            {filteredGenres.map((option) => (
              <button
                key={option}
                className={`bubble ${
                  preferences.genres.includes(option) ? "selected" : ""
                }`}
                onClick={() => toggleSelection("genres", option)}
              >
                {option}
              </button>
            ))}
          </div>
          </section>
        )}

        {/* Section 2.5 - Techno Subgenres */}
        {hasTechnoSubgenres && (
          <section className="onboarding-section techno-section">
            <h2 className="onboarding-subheadline">
              What kind of Techno?
            </h2>
            <p className="onboarding-helper">
              Select specific styles you enjoy
            </p>
            {Object.entries(filteredTechnoSubgenres).map(([category, subgenres]) => (
              <div key={category} className="techno-category">
                <h3 className="techno-category-title">{category}</h3>
                <div className="bubble-grid techno-subgenre-grid">
                  {subgenres.map((subgenre) => (
                    <button
                      key={subgenre}
                      className={`bubble techno-bubble ${
                        preferences.technoSubgenres.includes(subgenre) ? "selected" : ""
                      }`}
                      onClick={() => toggleSelection("technoSubgenres", subgenre)}
                    >
                      {subgenre}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

      </div>

      {/* Fixed Footer with Actions */}
      <div className="onboarding-footer">
        <div className="footer-left">
          <button className="skip-button" onClick={handleSkip}>
            Skip
          </button>
          {totalSelections > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>
        <button className="continue-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
