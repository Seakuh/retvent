import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcessingAnimation.css";

const processingSteps = [
  { text: "Image uploaded successfully", emoji: "📸" },
  { text: "Analyzing event data", emoji: "🔍" },
  { text: "Processing object information", emoji: "📊" },
  { text: "Discovering location details", emoji: "📍" },
  { text: "Gathering internet data", emoji: "🌐" },
];

interface ProcessingAnimationProps {
  onComplete?: () => void;
  eventId?: string;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({
  onComplete,
  eventId,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      // Zeige Benachrichtigung
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Event successfully uploaded!", {
              body: "Your event has been successfully processed.\n Credited 20 points to your account.",
              icon: "/logo.png",
            });
          }
        });
      }

      // Warte kurz und blende dann aus
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
        if (eventId) {
          navigate(`/event/${eventId}`);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete, eventId, navigate]);

  if (isComplete) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-lg transition-opacity duration-300">
        <div className="p-8 rounded-3xl w-[90%] max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6">
              <div className="success-checkmark"></div>
            </div>
          </div>
          <div className="text-white text-xl font-bold mb-4">
            Event successfully uploaded! +20 Points
          </div>
          <div className="text-white/80">You will be redirected shortly...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-lg transition-opacity duration-300 pointer-events-none">
      <div className="p-8 rounded-3xl w-[90%] max-w-md text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="scanning-circle"></div>
          </div>
        </div>

        <div className="space-y-4">
          {processingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                index <= currentStep
                  ? "bg-blue-900/80 backdrop-blur-sm"
                  : "bg-blue-900/60 backdrop-blur-sm"
              }`}
            >
              <span className="text-white text-lg">{step.text}</span>
              <span className="text-2xl">
                {index < currentStep ? "✅" : step.emoji}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
