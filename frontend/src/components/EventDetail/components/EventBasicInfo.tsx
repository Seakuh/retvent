import { Calendar, MapPin } from "lucide-react";

interface address {
  city?: string;
  houseNumber?: string;
  street?: string;
}

interface EventBasicInfoProps {
  startDate?: string;
  startTime?: string;
  city?: string;
  category?: string;
  address?: address;
  handleAddToCalendar?: () => void;
}

export const EventBasicInfo: React.FC<EventBasicInfoProps> = ({
  startDate,
  startTime,
  city,
  address,
  handleAddToCalendar,
}) => {
  return (
    <div className="event-basic-info">
      {/* <h2 className="section-headline">Date & Time</h2> */}
      <div
        className="info-item calendar-text-container"
        onClick={handleAddToCalendar}
      >
        <span className="icon">
          <Calendar className="h-5 w-5" />
        </span>
        <div className="info-text">
          {startDate && (
            <div onClick={() => handleAddToCalendar}>
              {new Date(startDate).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          )}
          {startTime && <div>{startTime}</div>}
        </div>
      </div>

      <div className="info-item location-text">
        <span className="icon">
          <MapPin className="h-5 w-5" />
        </span>
        <div
          className="info-text"
          onClick={() => {
            if (
              address &&
              address.street &&
              address.houseNumber &&
              address.city
            ) {
              window.open(
                `https://www.google.com/maps?q=${address.street}, ${address.houseNumber}, ${address.city}`,
                "_blank"
              );
            } else if (city) {
              window.open(`https://www.google.com/maps?q=${city}`, "_blank");
            }
          }}
        >
          {city && <div className="text-lg font-semibold">{city}</div>}
          {address && (
            <div>
              {address.street} {address.houseNumber}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
