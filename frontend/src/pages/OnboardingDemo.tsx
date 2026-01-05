import React from "react";
import { useNavigate } from "react-router-dom";
import Onboarding from "../components/Onboarding";
import { onboardingService } from "../services/onboarding.service";

const OnboardingDemo: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    console.log("✅ Onboarding completed");
    // Reset for demo purposes
    setTimeout(() => {
      console.log("🔄 Resetting onboarding for demo...");
      onboardingService.resetOnboarding();
    }, 2000);
  };

  const handleSkip = () => {
    console.log("⏭️  Onboarding skipped");
    // Reset for demo purposes
    setTimeout(() => {
      console.log("🔄 Resetting onboarding for demo...");
      onboardingService.resetOnboarding();
    }, 2000);
  };

  return <Onboarding onComplete={handleComplete} onSkip={handleSkip} />;
};

export default OnboardingDemo;
