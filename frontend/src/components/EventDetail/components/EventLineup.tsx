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
    <h2 className="section-headline">Lineup</h2>
    <div className="lineup-grid">
      {lineup.map((artist) => (
        <div key={artist._id} className="lineup-artist">
          <h3 className="lineup-artist-name">{artist.name}</h3>
          {artist.role && <span className="artist-role">{artist.role}</span>}
          {artist.startTime && (
            <span className="artist-time">{artist.startTime}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);
