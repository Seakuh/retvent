import React from "react";
import { TrendsListView } from "../EventPage/TrendsListView";
import "./OnboardingRecommendations.css";

interface RecommendedEvent {
  event: any;
  matchPercentage: number;
}

interface OnboardingRecommendationsProps {
  events: RecommendedEvent[];
  onContinue: () => void;
}

const OnboardingRecommendations: React.FC<OnboardingRecommendationsProps> = ({
  events,
  onContinue,
}) => {
  console.log("OnboardingRecommendations rendered with events:", events);
  
  if (!events || events.length === 0) {
    console.log("No events to display");
    return null;
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h1 className="recommendations-title">Your personalized events</h1>
        <p className="recommendations-subtitle">
          Based on your preferences, here are the events that match your taste
        </p>
      </div>

      <div className="recommendations-list">
        {events.map((item, index) => (
          <TrendsListView
            key={item.event._id || item.event.id || `recommendation-${index}`}
            event={item.event}
            index={index}
            matchPercentage={item.matchPercentage}
            viewMode="list"
          />
        ))}
      </div>

      <div className="recommendations-footer">
        <button className="continue-button" onClick={onContinue}>
          Explore Events
        </button>
      </div>
    </div>
  );
};

export default OnboardingRecommendations;
