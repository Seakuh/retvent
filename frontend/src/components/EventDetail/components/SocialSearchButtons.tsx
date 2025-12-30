import React from "react";
import "./SocialSearchButtons.css";

interface SocialSearchButtonsProps {
  title: string;
}

export const SocialSearchButtons: React.FC<SocialSearchButtonsProps> = ({
  title,
}) => {
  const handleGoogleSearch = () => {
    const searchQuery = `site:google.com ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleFacebookSearch = () => {
    const searchQuery = `site:facebook.com ${title}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, "_blank");
  };

  const handleInstagramSearch = () => {
    const searchQuery = `site:instagram.com ${title}`;
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
    </div>
  );
};

