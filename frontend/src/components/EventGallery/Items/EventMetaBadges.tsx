import { CalendarIcon, MapPin } from "lucide-react";
import { formatDate, getDaysUntilDate } from "../../../utils";
import "./EventMetaBadges.css";

interface EventMetaBadgesProps {
  city?: string;
  startDate?: string;
}

export const EventMetaBadges: React.FC<EventMetaBadgesProps> = ({
  city,
  startDate,
}) => {
  const formatDateDisplay = (date: string) => {
    try {
      const formattedDate = formatDate(date);
      const days = getDaysUntilDate(formattedDate);

      return (
        <>
          {formattedDate}{" "}
          {days === 0
            ? "| today"
            : days === 1
            ? "| tomorrow"
            : days === -1
            ? "| yesterday"
            : days < 0
            ? `| ${Math.abs(days)} days ago`
            : `| in ${days} days`}
        </>
      );
    } catch (error) {
      console.error("Error while formatting date:", error);
      return <span>No date available</span>;
    }
  };

  return (
    <div className="event-meta-badges-container">
      <span className="event-meta-badge event-meta-badge-location">
        <MapPin size={14} color="white" />
        {city || "TBA"}
      </span>
      {startDate && (
        <span className="event-meta-badge event-meta-badge-date">
          <CalendarIcon size={16} color="white" />
          {formatDateDisplay(startDate)}
        </span>
      )}
    </div>
  );
};








