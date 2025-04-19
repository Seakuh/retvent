import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ArtistModal from "../components/ArtistModal/ArtistModal";
import { Artist } from "../utils";
import "./ArtistPage.css";
import { PlayMusicCard } from "./PlayMusicCard";
import { getArtist } from "./service";
export const ArtistPage = () => {
  const { artistName } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [soundCloudLinks, setSoundCloudLinks] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!artistName) return;
      setIsLoading(true);
      try {
        const fetchedArtist = await getArtist(artistName);
        if (fetchedArtist) {
          setArtist(fetchedArtist);
          setSoundCloudLinks(
            fetchedArtist.links?.filter((link) =>
              link.includes("soundcloud")
            ) || null
          );
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching artist:", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtist();
  }, [artistName]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (notFound) {
    return <ArtistModal onClose={() => {}} artistName={artistName!} />;
  }

  return (
    <div className="artist-page-container">
      <div className="artist-page-image-container">
        <img src={artist?.profileImageUrl} alt={artist?.username} />
      </div>
      <h1>{artist?.username}</h1>
      <div className="artist-page-description-container">
        <p>{artist?.bio}</p>
      </div>
      <div className="artist-page-releases-container">
        {soundCloudLinks && (
          <PlayMusicCard links={soundCloudLinks} id={artist?.id} />
        )}
      </div>
      <div className="artist-page-social-media-container">
        <p>Social Media</p>
      </div>
      <div className="artist-page-events-container">
        <p>Events</p>
      </div>
    </div>
  );
};
