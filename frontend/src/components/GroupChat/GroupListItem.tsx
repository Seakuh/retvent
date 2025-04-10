import { useNavigate } from "react-router-dom";
import { DEFAULT_IMAGE, Group } from "../../utils";
import "./GroupListItem.css";
export const GroupListItem = ({ group }: { group: Group }) => {
  const navigate = useNavigate();
  return (
    <div
      className="group-list-item"
      onClick={() => navigate(`/group/${group.id}`)}
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
