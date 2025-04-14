import { useNavigate } from "react-router-dom";
import { DEFAULT_IMAGE, Group } from "../../utils";
import "./GroupListItem.css";
import { useChat } from "./chatProvider";
export const GroupListItem = ({ group }: { group: Group }) => {
  const { setCurrentGroup, setCurrentEvent } = useChat();
  const navigate = useNavigate();
  return (
    <div
      className="group-list-item"
      onClick={() => {
        setCurrentGroup(group._id!);
        setCurrentEvent(group.eventId!);
        navigate(`/group/${group._id}`);
      }}
    >
      <div className="group-list-item-image">
        <img src={group.imageUrl || DEFAULT_IMAGE} alt={group.name} />
      </div>
      <div className="group-list-item-content">
        <div className="group-list-item-name">{group.name}</div>
        <div className="group-list-item-description">{group.description}</div>
      </div>
    </div>
  );
};
