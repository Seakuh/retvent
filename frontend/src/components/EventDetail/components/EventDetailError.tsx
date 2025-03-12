interface EventDetailErrorProps {
  message?: string;
}

export const EventDetailError: React.FC<EventDetailErrorProps> = ({
  message = "Event nicht gefunden",
}) => (
  <div className="event-detail-error">
    <div className="error-content">
      <span className="error-icon">😢</span>
      <h2>Oops!</h2>
      <p>{message}</p>
      <button onClick={() => window.history.back()} className="back-button">
        ← Zurück
      </button>
    </div>
  </div>
);
