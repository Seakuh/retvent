import { useEffect, useRef } from "react";
import "./SponsoredDetail.css";

export const SponsoredDetail = ({ size = "m" }: { size?: "s" | "m" | "l" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ads = [
    {
      id: 1,
      title: "Schallwerk Headphones",
      video: "https://imagebucket.hel1.your-objectstorage.com/tmprqg0ybrh.mp4",
      link: "https://schallwerk.eu?ref=OTQxMTg5LjM0OTcuMTE3ODg0My5U",
    },
    {
      id: 2,
      title: "Lighter DIY",
      video: "https://imagebucket.hel1.your-objectstorage.com/tmpdlv1tkdy.mp4",
      link: "https://www.instagram.com/sturmzx2/",
    },
    {
      id: 2,
      title: "Lighter DIY",
      video: "https://imagebucket.hel1.your-objectstorage.com/tmpdlv1tkdy.mp4",
      link: "https://www.instagram.com/sturmzx2/",
    },
    {
      id: 3,
      title: "MIDI Controler DIY",
      video: "https://imagebucket.hel1.your-objectstorage.com/tmpdlv1tkdy.mp4",
      link: "https://bitchboy.lol/",
    },
  ];

  const ad = ads[Math.floor(Math.random() * ads.length)];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Startzustand: pausiert, bis sichtbar
    video.pause();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          video.play().catch(() => {
            // Autoplay kann vom Browser blockiert werden; hier bewusst ignoriert
            void 0;
          });
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.5, 1] }
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className={`sponsored-detail ${size}-size`}
      onClick={() => window.open(ad.link, "_blank")}
    >
      <div className="sponsored-watermark">sponsored</div>

      <div className="video-frame">
        <video
          ref={videoRef}
          src={ad.video}
          className="sponsored-video"
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </div>
  );
};
