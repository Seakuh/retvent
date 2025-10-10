import "./SponsoredDetail.css";

export const SponsoredDetail = ({ size = "m" }: { size?: "s" | "m" | "l" }) => {
  const ads = [
    {
      id: 1,
      title: "Schallwerk Headphones",
      video:
        "https://event-scanner.b-cdn.net/event-scanner-advertisement/videos/tmprqg0ybrh.mp4",
      link: "https://schallwerk.eu?ref=OTQxMTg5LjM0OTcuMTE3ODg0My5U",
    },
    {
      id: 2,
      title: "Lighter DIY",
      video:
        "https://event-scanner.b-cdn.net/event-scanner-advertisement/videos/tmpdlv1tkdy.mp4",
      link: "https://www.instagram.com/sturmzx2/",
    },
  ];

  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div
      className={`sponsored-detail ${size}-size`}
      onClick={() => window.open(randomAd.link, "_blank")}
    >
      <iframe
        src={randomAd.video}
        className="sponsored-video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={randomAd.title}
      />
    </div>
  );
};
