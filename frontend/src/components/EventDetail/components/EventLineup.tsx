import { ExternalLink } from "lucide-react";

interface LineupArtist {
  name: string;
  role?: string;
  startTime?: string;
  _id: string;
}

export const EventLineup: React.FC<{ lineup: LineupArtist[] }> = ({
  lineup,
}) => (
  <div className="event-lineup">
    <div className="lineup-grid">
      <h2 className="section-headline">Lineup</h2>
      {lineup.map((artist) => (
        <div key={artist._id} className="lineup-artist">
          <div className="lineup-artist-info">
            <div className="artist-header">
              <h3 className="lineup-artist-name">{artist.name}</h3>
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(
                  artist.name + " DJ"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="artist-search-link"
              >
                <ExternalLink size={20} />
              </a>
            </div>
            {artist.role && <span className="artist-role">{artist.role}</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);
