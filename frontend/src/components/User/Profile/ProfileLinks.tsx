import { Link } from "lucide-react";
import "./ProfileLinks.css";

interface ProfileLinksProps {
  links: string[];
}

export const ProfileLinks = ({ links }: ProfileLinksProps) => {
  // show only 5 links
  const linksArray: string[] = links.slice(0, 5);

  const getLinkName = (link: string): string => {
    try {
      const url = new URL(link);
      return url.hostname.replace("www.", "");
    } catch (error) {
      console.log("Fehler beim Parsen der URL:", error);
      return link;
    }
  };

  return (
    <div className="profile-links-container">
      <Link size={17} />
      <div className="profile-links">
        {linksArray.map((link, index) => (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-link-item"
            key={link + index}
          >
            {getLinkName(link)}
          </a>
        ))}
      </div>
    </div>
  );
};
