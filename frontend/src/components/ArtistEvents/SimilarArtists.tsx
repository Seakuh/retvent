import React, { useMemo } from "react";
import { Event } from "../../utils";
import { EventLineup } from "../EventDetail/components/EventLineup";

interface SimilarArtistsProps {
  events: Event[];
  currentArtistName: string;
}

export const SimilarArtists: React.FC<SimilarArtistsProps> = ({
  events,
  currentArtistName,
}) => {

  const similarArtists = useMemo(() => {
    const artistsSet = new Set<string>();
    
    events.forEach((event) => {
      event.lineup?.forEach((artist) => {
        const artistName = artist.name.trim();
        if (
          artistName &&
          artistName.toLowerCase() !== currentArtistName.toLowerCase()
        ) {
          artistsSet.add(artistName);
        }
      });
    });

    return Array.from(artistsSet).slice(0, 10); // Max 10 artists
  }, [events, currentArtistName]);

  if (similarArtists.length === 0) {
    return null;
  }

  return (
    <div>
      <EventLineup lineup={similarArtists.map((artistName) => ({ name: artistName, _id: artistName }))} lineupPictureUrls={[]} />
    </div>
  );
};

