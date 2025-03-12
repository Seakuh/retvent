import { Calendar, MapPin } from "lucide-react";

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
      <span className="icon">
        <Calendar className="h-5 w-5" />
      </span>
      <div className="info-text">
        {startDate && (
          <div className="text-lg font-semibold">
            {new Date(startDate).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
        )}
        {startTime && <div className="text-sm text-gray-600">{startTime}</div>}
      </div>
    </div>

    <div className="info-item">
      <span className="icon">
        <MapPin className="h-5 w-5" />
      </span>
      <div className="info-text">
        {city && <div className="text-lg font-semibold">{city}</div>}
        {category && <div className="text-sm text-gray-600">{category}</div>}
      </div>
    </div>
  </div>
);
