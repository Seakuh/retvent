import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultProfileImage } from "../../../utils";
interface LineupArtist {
  name: string;
  role?: string;
  startTime?: string;
  _id: string;
  profileId?: string;
}

export const EventLineup: React.FC<{ lineup: LineupArtist[] }> = ({
  lineup,
}) => {
  const navigate = useNavigate();
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const handleOnArtistClick = (artist: LineupArtist) => {
    navigate(`/profile/${artist.name}`);
  };
  const [artist, setArtist] = useState<LineupArtist | null>(null);

  // const handleOnArtistClose = () => {
  //   console.log("closing");
  //   setIsArtistModalOpen(false);
  //   setArtist(null);
  // };

  return (
    <div className="event-lineup">
      {/* {isArtistModalOpen && (
        <ArtistModal onClose={handleOnArtistClose} artist={artist} />
      )} */}
      <div className="lineup-grid">
        <h2 className="section-headline">Artists</h2>
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
              <div className="lineup-artist-info">
                <div className="artist-header-link-container">
                  <div className="artist-header">
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(
                        artist.name + " " + artist.role || " DJ"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="artist-search-link"
                    >
                      <h3 className="lineup-artist-name">{artist.name}</h3>
                      {artist.role && (
                        <span className="artist-role">{artist.role}</span>
                      )}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
