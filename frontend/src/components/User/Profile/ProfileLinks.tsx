import { Link } from "lucide-react";
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
      <Link size={17} />
      <div className="profile-links">
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
    </div>
  );
};
