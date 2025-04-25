import {
  Bed,
  Car,
  HeartHandshake,
  Palette,
  Shirt,
  Snowflake,
} from "lucide-react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../contexts/UserContext";
import { Event } from "../../../utils";
import { GroupInviteModal } from "../../CommunityDetailBar/Modals/GroupInviteModal";
import { createOrJoinGroupService } from "../service";
import "./EventGroups.css";
export const EventGroups = ({ event }: { event: Event }) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isGroupInviteModalOpen, setIsGroupInviteModalOpen] = useState(false);

  const createOrJoinGroup = (group: string) => {
    createOrJoinGroupService(event, group).then((data) => {
      if (data) {
        navigate(`/group/${data._id!}`);
      }
      if (data.error) {
        console.error(data.error);
      }
    });
  };

  return (
    <div className="event-groups-container">
      {isGroupInviteModalOpen && (
        <GroupInviteModal
          onClose={() => setIsGroupInviteModalOpen(false)}
          event={event}
          userId={user?.id || ""}
        />
      )}
      <h2>Chats</h2>
      <ul className="event-groups-community-list">
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Helper")}
        >
          <HeartHandshake size={20} />
          <h3>Helper</h3>
        </button>
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Driver")}
        >
          <Car size={20} />
          <h3>Driver</h3>
        </button>
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Artist")}
        >
          <Palette size={20} />
          <h3>Artist</h3>
        </button>
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Sleep")}
        >
          <Bed size={20} />
          <h3>Sleep</h3>
        </button>
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Lost-Found")}
        >
          <Shirt size={20} />
          <h3>Lost & Found</h3>
        </button>
        <button
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("Queue")}
        >
          <Snowflake size={20} />
          <h3>Queue</h3>
        </button>
      </ul>
    </div>
  );
};
