import { useNavigate } from "react-router-dom";
import { EventProfile } from "../../../utils";
import "./EventHost.css";
export const EventHost = ({
  host,
  userId,
}: {
  host: EventProfile;
  userId: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="event-host">
      <h2 className="section-headline">Uploader</h2>
      <a
        className="event-host-info"
        onClick={() => {
          navigate(`/profile/${userId}`);
        }}
      >
        <img src={host.profileImageUrl} alt={host.username} />
        <p className="event-host-name">{host.username}</p>
      </a>
    </div>
  );
};
