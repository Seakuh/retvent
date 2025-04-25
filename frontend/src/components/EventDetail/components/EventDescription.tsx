import "./EventDescription.css";

interface EventDescriptionProps {
  title: string;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
}) => {
  return (
    <>
      {description && (
        <div className="event-description-container">
          <div className="event-description-section">
            <h2 className="section-headline">Description</h2>
            <div className="event-description-text">{description}</div>
          </div>
        </div>
      )}
    </>
  );
};
