import { ChevronLeft } from "lucide-react";

interface EventDetailErrorProps {
  message?: string;
}

export const EventDetailError: React.FC<EventDetailErrorProps> = ({
  message = "Event not found",
}) => (
  <div className="event-detail-error">
    <div className="error-content">
      <span className="error-icon">😢</span>
      <h2>Oops!</h2>
      <p>{message}</p>
      <button onClick={() => window.history.back()} className="back-button">
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  </div>
);
