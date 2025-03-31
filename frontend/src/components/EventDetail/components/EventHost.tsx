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
  console.log(host);
  const navigate = useNavigate();
  return (
    <div className="event-host">
      <h2 className="section-headline">Uploader</h2>
      <div
        className="event-host-info"
        onClick={() => {
          navigate(`/profile/${userId}`);
        }}
      >
        <p className="event-host-name">{host.username}</p>
        <img src={host.profileImageUrl} alt={host.username} />
      </div>
    </div>
  );
};
