interface EventInfoProps {
  title: string;
  description?: string;
  startDate?: string;
  startTime?: string;
  category?: string;
  price?: string;
  ticketLink?: string;
}

export const EventInfo: React.FC<EventInfoProps> = ({
  title,
  description,
  startDate,
  startTime,
  category,
  price,
  ticketLink,
}) => (
  <div className="event-info">
    <div className="event-info-header">
      <h1>{title}</h1>
      {category && <span className="event-category">{category}</span>}
    </div>

    {(startDate || startTime) && (
      <div className="event-datetime">
        {startDate && (
          <div className="event-date">
            <Calendar />
            {new Date(startDate).toLocaleDateString()}
          </div>
        )}
        {startTime && (
          <div className="event-time">
            <Clock />
            {startTime}
          </div>
        )}
      </div>
    )}

    {description && <p className="event-description">{description}</p>}

    {(price || ticketLink) && (
      <div className="event-ticket-info">
        {price && <div className="event-price">{price}</div>}
        {ticketLink && <TicketButton href={ticketLink} />}
      </div>
    )}
  </div>
);
