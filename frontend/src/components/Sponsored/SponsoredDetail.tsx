import "./SponsoredDetail.css";

export const SponsoredDetail = ({ size = "m" }: { size?: "s" | "m" | "l" }) => {
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
  ];

  const ad = ads[Math.floor(Math.random() * ads.length)];

  return (
    <div
      className={`sponsored-detail ${size}-size`}
      onClick={() => window.open(ad.link, "_blank")}
    >
      <div className="sponsored-watermark">sponsored</div>

      <div className="video-frame">
        <video
          src={ad.video}
          className="sponsored-video"
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
    </div>
  );
};
