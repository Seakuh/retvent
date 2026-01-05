const API_URL = import.meta.env.VITE_API_URL;

export interface OnboardingPreferences {
  eventType?: { [key: string]: string[] };
  genreStyle?: { [key: string]: string[] };
  context?: { [key: string]: string[] };
  communityOffers?: { [key: string]: string[] };
  region?: string;
}

export interface OnboardingResponse {
  events: any[];
}

export const onboardingService = {
  // Save onboarding preferences and get personalized events
  savePreferencesAndGetEvents: async (
    preferences: OnboardingPreferences,
    limit = 20
  ): Promise<OnboardingResponse> => {
    const token = localStorage.getItem("access_token");

    console.log("🎯 Sending onboarding preferences:", preferences);

    try {
      const response = await fetch(
        `${API_URL}events/onboarding?limit=${limit}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get personalized events");
      }

      const data = await response.json();
      console.log("✅ Received personalized events:", data);
      return data;
    } catch (error) {
      console.error("❌ Error in onboarding:", error);
      throw error;
    }
  },

  // Check if user has completed onboarding
  hasCompletedOnboarding: (): boolean => {
    const completed = localStorage.getItem("onboarding_completed");
    console.log("🔍 Onboarding completed:", completed === "true");
    return completed === "true";
  },

  // Mark onboarding as completed
  markOnboardingComplete: () => {
    localStorage.setItem("onboarding_completed", "true");
    console.log("✅ Onboarding marked as completed in localStorage");
  },

  // Reset onboarding (for testing)
  resetOnboarding: () => {
    localStorage.removeItem("onboarding_completed");
    console.log("🔄 Onboarding reset");
  },
};
