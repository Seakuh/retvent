interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export const EventSocial: React.FC<{ links: SocialMediaLinks }> = ({
  links,
}) => (
  <div className="event-social">
    <h2>📱 Social Media</h2>
    <div className="social-links">
      {links.instagram && (
        <a
          href={links.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link instagram"
        >
          <span className="icon">📸</span>
          Instagram
        </a>
      )}
      {links.facebook && (
        <a
          href={links.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link facebook"
        >
          <span className="icon">👥</span>
          Facebook
        </a>
      )}
      {links.twitter && (
        <a
          href={links.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link twitter"
        >
          <span className="icon">🐦</span>
          Twitter
        </a>
      )}
    </div>
  </div>
);
