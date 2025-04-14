import { Bed, Car, HeartHandshake, Palette, Plus, Shirt } from "lucide-react";
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
    console.log("createOrJoinGroup", group);
    createOrJoinGroupService(event, group).then((data) => {
      if (data) {
        console.log("data", data);
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
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("helper")}
        >
          <HeartHandshake size={20} />
          <h3>Helper</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("driver")}
        >
          <Car size={20} />
          <h3>Driver</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("artist")}
        >
          <Palette size={20} />
          <h3>Artist</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("sleep")}
        >
          <Bed size={20} />
          <h3>Sleep</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("lost-found")}
        >
          <Shirt size={20} />
          <h3>Lost & Found</h3>
        </li>
        <li
          className="event-groups-community-item"
          onClick={() => createOrJoinGroup("other")}
        >
          <Plus size={20} />
          <h3>Create</h3>
        </li>
      </ul>
    </div>
  );
};
