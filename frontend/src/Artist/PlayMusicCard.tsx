import { Pause, Play } from "lucide-react";
import { useState } from "react";
import "./PlayMusicCard.css";

interface PlayMusicCardProps {
  links?: string[] | undefined;
  trackId: string;
}

export const PlayMusicCard = ({ links, trackId }: PlayMusicCardProps) => {
  const [play, setPlay] = useState<boolean>(false);

  console.log(links);
  if (!links) {
    return null;
  }

  const handlePlay = () => {
    setPlay(!play);
  };

  return (
    <div className="play-music-card-container">
      <div className="play-music-card">
        <button onClick={handlePlay}>{play ? <Pause /> : <Play />}</button>
        {/* {links.map((link) => (
          <a href={link} key={link}>
            {link}
          </a>
        ))} */}
      </div>
      {play ? (
        <iframe
          className="play-music-card-iframe"
          width="100%"
          height="300"
          scrolling="no"
          frameborder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2022296545&color=%23424744&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
        ></iframe>
      ) : null}
    </div>
  );
};
