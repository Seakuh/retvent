import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "./Onboarding";
import { onboardingService } from "../../services/onboarding.service";

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  const handleOnboardingComplete = () => {
    console.log("✅ Onboarding completed, proceeding to app");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    console.log("⏭️  Onboarding skipped, proceeding to app");
    setShowOnboarding(false);
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

  // Show the wrapped content
  return <>{children}</>;
};

export default OnboardingWrapper;
