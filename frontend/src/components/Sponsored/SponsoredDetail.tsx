import "./SponsoredDetail.css";

export const SponsoredDetail = () => {
  const ads = [
    {
      id: 1,
      title: "Schallwerk Headphones",
      video:
        "https://event-scanner.b-cdn.net/play/509542/e30a068e-975d-4fe8-9b3b-4ae267792312",
      link: "https://schallwerk.eu?ref=OTQxMTg5LjM0OTcuMTE3ODg0My5U",
    },
    {
      id: 2,
      title: "Lighter DIY",
      video:
        "https://event-scanner.b-cdn.net/play/509542/b15cf162-4b5f-4aa3-8177-09ea80dbcf01",
      link: "https://www.instagram.com/sturmzx2/",
    },
  ];

  const randomAd = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div
      className="sponsored-detail"
      onClick={() => window.open(randomAd.link, "_blank")}
    >
      <div className="sponsored-watermark">sponsored</div>
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
