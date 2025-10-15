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
  description?: string;
  category?: string;
  address?: address;
  handleAddToCalendar?: () => void;
}

export const EventBasicInfo: React.FC<EventBasicInfoProps> = ({
  startDate,
  startTime,
  city,
  address,
  description,
  category,
  handleAddToCalendar,
}) => {
  return (
    <div className="event-basic-info">
      {/* <h2 className="section-headline">Date & Time</h2> */}
      <button
        className="button-17 info-item calendar-text-container"
        onClick={handleAddToCalendar}
      >
        <div className="info-text">
          <div className="map-plus-calendar-container">
            <Calendar className="navigation-info-icon h-5 w-5" />
          </div>
          <div>
            {startDate && (
              <div onClick={() => handleAddToCalendar}>
                {new Date(startDate).toLocaleDateString("de-DE", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </div>
            )}
            {startTime && <div>{startTime}</div>}
          </div>
        </div>
      </button>

      <button
        className="button-17 info-item location-text"
        onClick={() => {
          // Baue ein Array der vorhandenen Teile der Adresse
          const parts = [
            address?.street,
            address?.houseNumber,
            address?.city,
          ].filter(Boolean); // entfernt undefined/null/leere Strings

          const searchQuery = parts.length > 0 ? parts.join(", ") : city || "";

          if (searchQuery) {
            window.open(
              `https://www.google.com/maps?q=${encodeURIComponent(
                searchQuery
              )}`,
              "_blank"
            );
          } else {
            alert("Keine Adresse verfügbar für die Maps-Suche");
          }
        }}
      >
        <div className="info-text">
          <div className="map-plus-calendar-container">
            <MapPin className="navigation-info-icon h-5 w-5" />
          </div>
          <div>
            {city ? (
              <div className="text-lg font-semibold">{city}</div>
            ) : (
              <div className="text-lg font-semibold">TBA</div>
            )}
            {address ? (
              <div>
                {address.street} {address.houseNumber}
              </div>
            ) : (
              <div>TBA</div>
            )}
          </div>
        </div>
      </button>
      {/* <hr className="border-gray-700" /> */}
      {/* <div className="event-basic-info-description"> */}
      {/* <div className="event-description-text">{description}</div> */}
    </div>
  );
};
