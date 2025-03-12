interface EventBasicInfoProps {
  startDate?: string;
  startTime?: string;
  city?: string;
  category?: string;
}

export const EventBasicInfo: React.FC<EventBasicInfoProps> = ({
  startDate,
  startTime,
  city,
  category,
}) => (
  <div className="event-basic-info">
    {/* <h2 className="section-headline">Date & Time</h2> */}
    <div className="info-item">
      <span className="icon">📅</span>
      <div className="info-text">
        {startDate && <div>{new Date(startDate).toLocaleDateString()}</div>}
        {startTime && <div>{startTime}</div>}
      </div>
    </div>

    <div className="info-item">
      <span className="icon">📍</span>
      <div className="info-text">
        {city && <div>{city}</div>}
        {category && <div>{category}</div>}
      </div>
    </div>
  </div>
);
