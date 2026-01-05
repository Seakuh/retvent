import { onboardingService } from "../services/onboarding.service";

/**
 * Helper functions for testing and debugging onboarding
 *
 * Usage in browser console:
 *
 * // Check if onboarding is completed
 * window.checkOnboarding()
 *
 * // Reset onboarding to see it again
 * window.resetOnboarding()
 *
 * // Force show onboarding
 * window.forceOnboarding()
 */

export const onboardingHelpers = {
  /**
   * Check onboarding status
   */
  checkStatus: () => {
    const isCompleted = onboardingService.hasCompletedOnboarding();
    const isLoggedIn = !!localStorage.getItem("access_token");

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 ONBOARDING STATUS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📝 Completed: ${isCompleted ? "✅ Yes" : "❌ No"}`);
    console.log(`🔐 Logged in: ${isLoggedIn ? "✅ Yes" : "❌ No"}`);
    console.log(`👁️  Should show: ${isLoggedIn && !isCompleted ? "✅ Yes" : "❌ No"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return {
      isCompleted,
      isLoggedIn,
      shouldShow: isLoggedIn && !isCompleted,
    };
  },

  /**
   * Reset onboarding (for testing)
   */
  reset: () => {
    onboardingService.resetOnboarding();
    console.log("🔄 Onboarding has been reset!");
    console.log("💡 Reload the page to see the onboarding again");
    return "Reset successful - reload page to see onboarding";
  },

  /**
   * Force onboarding to show (reset + reload)
   */
  force: () => {
    onboardingService.resetOnboarding();
    console.log("🔄 Resetting and reloading...");
    window.location.reload();
  },

  /**
   * Mark as completed without showing
   */
  complete: () => {
    onboardingService.markOnboardingComplete();
    console.log("✅ Onboarding marked as completed");
    return "Onboarding will not show again";
  },
};

// Expose to window for easy console access
declare global {
  interface Window {
    onboarding: typeof onboardingHelpers;
    checkOnboarding: typeof onboardingHelpers.checkStatus;
    resetOnboarding: typeof onboardingHelpers.reset;
    forceOnboarding: typeof onboardingHelpers.force;
    completeOnboarding: typeof onboardingHelpers.complete;
  }
}

if (typeof window !== "undefined") {
  window.onboarding = onboardingHelpers;
  window.checkOnboarding = onboardingHelpers.checkStatus;
  window.resetOnboarding = onboardingHelpers.reset;
  window.forceOnboarding = onboardingHelpers.force;
  window.completeOnboarding = onboardingHelpers.complete;
}
