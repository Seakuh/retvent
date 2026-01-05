import React, { useState } from "react";
import { onboardingService, OnboardingPreferences } from "../../services/onboarding.service";
import "./Onboarding.css";

interface OnboardingProps {
  onComplete: (events?: any[]) => void;
  onSkip: () => void;
}

export interface UserPreferences {
  mainListening: string[];
  genres: string[];
  vibes: string[];
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    mainListening: [],
    genres: [],
    vibes: [],
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

  const vibeOptions = ["Calm", "Curious", "Energetic", "Intimate", "Late-night"];

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

  const hasResults = filteredMainListening.length > 0 || filteredGenres.length > 0 || filteredVibes.length > 0;
  const totalSelections = preferences.mainListening.length + preferences.genres.length + preferences.vibes.length;

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

  const handleContinue = async () => {
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
      <div className="onboarding-header">
        <div className="search-container">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="onboarding-content">
        {/* No Results Message */}
        {searchQuery && !hasResults && (
          <div className="no-results">
            <p>No matches for "{searchQuery}"</p>
            <button
              className="clear-search"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
          </div>
        )}

        {/* Section 1 - Main Question */}
        {filteredMainListening.length > 0 && (
          <section className="onboarding-section">
            <h1 className="onboarding-headline">What do you mostly listen to?</h1>
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
          <h2 className="onboarding-subheadline">
            Any genres you come back to?
          </h2>
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

        {/* Section 3 - Optional Vibe Refinement */}
        {filteredVibes.length > 0 && (
          <section className="onboarding-section vibe-section">
          <p className="optional-label">Optional</p>
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
