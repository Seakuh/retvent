import "./SponsoredDetail.css";

export const SponsoredDetail = () => {
  return (
    <div
      className="sponsored-detail"
      onClick={() => {
        window.open(
          "https://schallwerk.eu?ref:OTQxMTg5LjM0OTcuMTE3ODg0My5U",
          "_blank"
        );
      }}
    >
      <div className="sponsored-watermark">Sponsored</div>
      <video
        src="https://iframe.mediadelivery.net/play/509542/e30a068e-975d-4fe8-9b3b-4ae267792312"
        className="sponsored-video"
        autoPlay
        muted
        playsInline
        loop
      />
    </div>
  );
};
