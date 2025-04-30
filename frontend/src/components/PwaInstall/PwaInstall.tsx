import { ChevronLeft, Smartphone } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PwaInstall.css";

export const PwaInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: any) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installation accepted");
    } else {
      console.log("PWA installation dismissed");
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleAlreadyInstalled = () => {
    navigate("/");
  };

  return (
    <div className="pwa-install-container">
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />
      </button>
      Install App
      <a onClick={handleInstallClick}>
        <img
          src="/logo.png"
          alt="Event-Scanner"
          className="w-20 h-20 mx-auto border border-[var(--color-neon-blue)] rounded-xl"
        />
      </a>
      <h1 className="section-title text-center mt-4">Event-Scanner</h1>
      <div className="text-left text-white leading-relaxed p-6 break-words max-w-[935px] mx-auto">
        <p>
          Event-Scanner is a platform that allows you to find and discover
          events in your area. Exchange your favorite events with your friends
          and discover new events. The community is for everyone to discuss and
          share their thoughts about events.
        </p>
        <section>
          <Smartphone className="w-20 h-20 text-white mx-auto mt-4 mb-4" />
          <br />
        </section>
        <p>
          Our Progressive Web App (PWA) combines the best of web and mobile apps
          — offering a smooth user experience, fast loading times, offline
          access, and the ability to install the app to the home screen. We use
          it to provide users with a faster, more beautiful, and reliable
          experience, even when offline.
        </p>
      </div>
      {showButton && (
        <button
          id="install-button"
          className="pwa-install-button"
          onClick={handleInstallClick}
        >
          Install App
        </button>
      )}
      {!showButton && (
        <button
          id="install-button"
          className="pwa-install-button"
          onClick={handleAlreadyInstalled}
        >
          App already installed
        </button>
      )}
    </div>
  );
};
