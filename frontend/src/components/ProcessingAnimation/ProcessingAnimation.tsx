import React, { useEffect, useState } from "react";
import "./ProcessingAnimation.css";

const processingSteps = [
  { text: "Image uploaded successfully", emoji: "📸" },
  { text: "Analyzing event data", emoji: "🔍" },
  { text: "Processing object information", emoji: "📊" },
  { text: "Discovering location details", emoji: "📍" },
  { text: "Gathering internet data", emoji: "🌐" },
];

export const ProcessingAnimation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < processingSteps.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/10 backdrop-blur-lg transition-opacity duration-300">
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
                  ? "bg-white/10 backdrop-blur-sm"
                  : "opacity-50"
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
