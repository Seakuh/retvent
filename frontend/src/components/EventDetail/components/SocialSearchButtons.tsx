import React from "react";
import "./SocialSearchButtons.css";

interface SocialSearchButtonsProps {
  title: string;
}

export const SocialSearchButtons: React.FC<SocialSearchButtonsProps> = ({
  title,
}) => {
  const handleGoogleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = `${title} event`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleFacebookSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = `site:facebook.com ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleInstagramSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = `site:instagram.com ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleRASearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = `site:ra.co ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleSoundcloudSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const searchQuery = `site:soundcloud.com ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="social-search-buttons-container">
      <button
        className="social-search-button google-button"
        onClick={handleGoogleSearch}
        aria-label="Suche auf Google"
      >
        <img
          src="/google.png"
          alt="Google"
          className="social-search-icon"
        />
        <span className="social-search-text">GOOGLE</span>
      </button>
      <button
        className="social-search-button soundcloud-button"
        onClick={handleSoundcloudSearch}
        aria-label="Suche auf Soundcloud"
      >
        <img
          src="/soundcloud.png"
          alt="Soundcloud"
          className="social-search-icon"
        />
        <span className="social-search-text">SOUNDCLOUD</span>
      </button>
      <button
        className="social-search-button instagram-button"
        onClick={handleInstagramSearch}
        aria-label="Suche auf Instagram"
      >
        <img
          src="/instagram.png"
          alt="Instagram"
          className="social-search-icon"
        />
        <span className="social-search-text">INSTAGRAM</span>
      </button>
      <button
        className="social-search-button ra-button"
        onClick={handleRASearch}
        aria-label="Suche auf RA"
      >
        <img
          src="/ra_guide.png"
          alt="RA"
          className="social-search-icon"
        />
        <span className="social-search-text">RA</span>
      </button>
      <button
        className="social-search-button facebook-button"
        onClick={handleFacebookSearch}
        aria-label="Suche auf Facebook"
      >
        <img
          src="/facebook.png"
          alt="Facebook"
          className="social-search-icon"
        />
        <span className="social-search-text">FACEBOOK</span>
      </button>
    </div>
  );
};

