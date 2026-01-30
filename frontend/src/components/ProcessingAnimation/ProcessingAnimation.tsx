import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProcessingAnimation.css";

const processingSteps = [
  { text: "Bild erfolgreich hochgeladen", emoji: "📸" },
  { text: "Bildqualität wird analysiert", emoji: "🔬" },
  { text: "Objekte werden erkannt", emoji: "👁️" },
  { text: "Text wird extrahiert (OCR)", emoji: "📝" },
  { text: "Farben werden analysiert", emoji: "🎨" },
  { text: "Event-Typ wird identifiziert", emoji: "🎭" },
  { text: "Datum & Uhrzeit werden gesucht", emoji: "📅" },
  { text: "Location wird ermittelt", emoji: "📍" },
  { text: "Künstler werden erkannt", emoji: "🎤" },
  { text: "Genre wird bestimmt", emoji: "🎵" },
  { text: "Preisinformationen werden gesucht", emoji: "💰" },
  { text: "Veranstalter wird identifiziert", emoji: "🏢" },
  { text: "Online-Datenbanken werden durchsucht", emoji: "🌐" },
  { text: "Social Media wird gescannt", emoji: "📱" },
  { text: "Ticketlinks werden gesucht", emoji: "🎫" },
  { text: "Ähnliche Events werden gefunden", emoji: "🔗" },
  { text: "Venue-Details werden geladen", emoji: "🏛️" },
  { text: "Karteninformationen werden geholt", emoji: "🗺️" },
  { text: "Metadaten werden zusammengeführt", emoji: "📊" },
  { text: "Event wird validiert", emoji: "✅" },
  { text: "Duplikate werden geprüft", emoji: "🔄" },
  { text: "Event wird in Datenbank gespeichert", emoji: "💾" },
  { text: "Suchindex wird aktualisiert", emoji: "🔍" },
  { text: "Benachrichtigungen werden vorbereitet", emoji: "🔔" },
  { text: "Punkte werden gutgeschrieben", emoji: "⭐" },
  { text: "Finalisierung läuft", emoji: "🚀" },
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
    }, 2500); // Längere Zeit pro Schritt

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      // Zeige Benachrichtigung
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Event erfolgreich hochgeladen!", {
              body: "Dein Event wurde erfolgreich verarbeitet.\n20 Punkte wurden deinem Konto gutgeschrieben.",
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
    return null;
  }

  // Zeige nur die letzten 5 Schritte im sichtbaren Bereich
  const visibleStartIndex = Math.max(0, currentStep - 4);
  const visibleSteps = processingSteps.slice(visibleStartIndex, currentStep + 1);

  return (
    <div className="processing-overlay">
      <div className="processing-container">
        {/* Animierter Hintergrund */}
        <div className="processing-bg-effects">
          <div className="processing-glow-orb processing-glow-1"></div>
          <div className="processing-glow-orb processing-glow-2"></div>
          <div className="processing-glow-orb processing-glow-3"></div>
        </div>

        {/* Hauptinhalt */}
        <div className="processing-content">
          {/* Spinner */}
          <div className="processing-spinner-wrapper">
            <div className="processing-spinner">
              <div className="processing-spinner-ring"></div>
              <div className="processing-spinner-ring"></div>
              <div className="processing-spinner-ring"></div>
              <div className="processing-spinner-core">
                <span className="processing-spinner-emoji">
                  {processingSteps[currentStep]?.emoji || "⚡"}
                </span>
              </div>
            </div>
          </div>

          {/* Fortschrittsanzeige */}
          <div className="processing-progress-info">
            <span className="processing-step-counter">
              Schritt {currentStep + 1} von {processingSteps.length}
            </span>
            <div className="processing-progress-bar">
              <div 
                className="processing-progress-fill"
                style={{ width: `${((currentStep + 1) / processingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Schritte Liste */}
          <div className="processing-steps-list">
            {visibleSteps.map((step, index) => {
              const actualIndex = visibleStartIndex + index;
              const isActive = actualIndex === currentStep;
              const isCompleted = actualIndex < currentStep;
              
              return (
                <div
                  key={actualIndex}
                  className={`processing-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: isActive ? 1 : isCompleted ? 0.6 : 0.3
                  }}
                >
                  <div className="processing-step-icon">
                    {isCompleted ? (
                      <span className="processing-check">✓</span>
                    ) : (
                      <span>{step.emoji}</span>
                    )}
                  </div>
                  <span className="processing-step-text">{step.text}</span>
                  {isActive && (
                    <div className="processing-step-loader">
                      <div className="processing-dot"></div>
                      <div className="processing-dot"></div>
                      <div className="processing-dot"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info Text */}
          <p className="processing-info-text">
            Bitte warten, dein Event wird verarbeitet...
          </p>
        </div>
      </div>
    </div>
  );
};
