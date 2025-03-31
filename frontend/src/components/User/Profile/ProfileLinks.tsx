import "./ProfileLinks.css";

interface ProfileLinksProps {
  links: string[];
}

const getLinkName = (link: string) => {
  // get domain
  const domain = new URL(link).hostname;
  return domain.replace("www.", "");
};

export const ProfileLinks = ({ links }: ProfileLinksProps) => {
  return (
    <div className="profile-links-container">
      <h2>Links</h2>
      {links.map((link) => (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-link"
          key={link}
        >
          {getLinkName(link)}
        </a>
      ))}
    </div>
  );
};
