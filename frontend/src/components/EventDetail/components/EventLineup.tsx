import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultProfileImage } from "../../../utils";
import { ImageModal } from "../../ImageModal/ImageModal";
import "./EventLineup.css";
interface LineupArtist {
  name: string;
  role?: string;
  startTime?: string;
  _id: string;
  profileId?: string;
}

export const EventLineup: React.FC<{
  lineup: LineupArtist[];
  lineupPictureUrls: string[];
}> = ({ lineup, lineupPictureUrls }) => {
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const handleOnArtistClick = (artist: LineupArtist) => {
    navigate(`/profile/${artist.name}`);
  };
  const handleOnLineupClick = (lineupPictureUrl: string) => {
    setSelectedImageUrl(lineupPictureUrl);
    setShowImageModal(true);
  };

  return (
    <div className="event-lineup">
      <div className="lineup-grid">
        {/* <h2 className="section-headline">Artists</h2> */}
        {lineupPictureUrls.length > 0 &&
          lineupPictureUrls.map((url) => (
            <img
              className="lineup-picture"
              src={`https://img.event-scanner.com/insecure/plain/${url}@webp`}
              alt="Lineup"
              onClick={() => handleOnLineupClick(url)}
            />
          ))}
        {lineup.map((artist) => (
          <div key={artist._id} className="lineup-artist">
            <div className="lineup-profile-sectaion">
              <div
                className="lineup-artist-image-wrapper"
                onClick={() => handleOnArtistClick(artist)}
              >
                <img
                  className="lineup-artist-image"
                  src={defaultProfileImage}
                  alt={artist.name}
                />
              </div>
              <div className="lineup-artist-info-container">
                <div className="lineup-artist-info">
                  <div className="artist-header-link-container">
                    <div className="artist-header">
                      <a onClick={() => handleOnArtistClick(artist)}>
                        <h3 className="lineup-artist-name">{artist.name}</h3>
                        {artist.role && (
                          <span className="artist-role">{artist.role}</span>
                        )}
                      </a>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    artist.name + " " + artist.role || " DJ"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linup-search-link"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showImageModal && (
        <ImageModal
          imageUrl={selectedImageUrl}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};
