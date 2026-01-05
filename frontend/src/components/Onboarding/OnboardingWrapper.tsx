import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "./Onboarding";
import OnboardingRecommendations from "./OnboardingRecommendations";
import { onboardingService } from "../../services/onboarding.service";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user needs to see onboarding
    const checkOnboarding = () => {
      const isCompleted = onboardingService.hasCompletedOnboarding();
      const isLoggedIn = !!localStorage.getItem("access_token");

      console.log("🔍 Checking onboarding status:");
      console.log("  - Is logged in:", isLoggedIn);
      console.log("  - Onboarding completed:", isCompleted);

      // Only show onboarding if user is logged in AND hasn't completed it
      if (isLoggedIn && !isCompleted) {
        console.log("👉 Showing onboarding");
        setShowOnboarding(true);
      } else {
        console.log("👉 Skipping onboarding");
        setShowOnboarding(false);
      }

      setIsChecking(false);
    };

    checkOnboarding();
  }, []);

  const handleOnboardingComplete = (events?: any[]) => {
    console.log("✅ Onboarding completed, showing recommendations");
    setShowOnboarding(false);

    if (events && events.length > 0) {
      setRecommendedEvents(events);
      setShowRecommendations(true);
    } else {
      // If no events, skip recommendations and go to app
      setShowRecommendations(false);
    }
  };

  const handleOnboardingSkip = () => {
    console.log("⏭️  Onboarding skipped, proceeding to app");
    setShowOnboarding(false);
    setShowRecommendations(false);
  };

  const handleRecommendationsContinue = () => {
    console.log("✅ Recommendations viewed, proceeding to app");
    setShowRecommendations(false);
  };

  // Show nothing while checking
  if (isChecking) {
    return null;
  }

  // Show onboarding if needed
  if (showOnboarding) {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show recommendations after onboarding
  if (showRecommendations && recommendedEvents.length > 0) {
    return (
      <OnboardingRecommendations
        events={recommendedEvents}
        onContinue={handleRecommendationsContinue}
      />
    );
  }

  // Show the wrapped content
  return <>{children}</>;
};

export default OnboardingWrapper;
