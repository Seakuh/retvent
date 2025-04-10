import { DEFAULT_IMAGE, Group } from "../../utils";
import "./GroupListItem.css";
export const GroupListItem = ({ group }: { group: Group }) => {
  return (
    <div className="group-list-item">
      <div className="group-list-item-image">
        <img src={group.imageUrl || DEFAULT_IMAGE} alt={group.name} />
      </div>
      <div className="group-list-item-name">{group.name}</div>
    </div>
  );
};
