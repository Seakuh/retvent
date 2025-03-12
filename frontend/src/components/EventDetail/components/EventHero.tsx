interface EventHeroProps {
  imageUrl?: string;
  title: string;
  onImageClick: () => void;
}
const DEFAULT_IMAGE =
  "https://images.vartakt.com/images/events/66e276a6-090d-4774-bc04-9f66ca56a0be.png";

export const EventHero: React.FC<EventHeroProps> = ({
  imageUrl,
  title,
  onImageClick,
}) => (
  <div className="event-hero" onClick={onImageClick}>
    <img
      src={imageUrl || DEFAULT_IMAGE}
      alt={title}
      className="event-hero-image"
    />
    <div className="event-hero-overlay">{/* <h1>{title}</h1> */}</div>
  </div>
);
