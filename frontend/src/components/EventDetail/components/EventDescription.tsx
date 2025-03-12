interface EventDescriptionProps {
  title: string;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
}) => (
  <div className="event-description-section">
    {description && <p className="event-description">{description}</p>}
  </div>
);
