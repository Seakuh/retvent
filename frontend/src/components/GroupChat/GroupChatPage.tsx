import { ChevronLeft } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Group } from "../../utils";
import { GroupListItem } from "./GroupListItem";
import { getGroups } from "./service";
export const GroupChatPage = () => {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getGroups();
      setGroups(groups);
    };
    fetchGroups();
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div>
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      {groups.map((group) => (
        <GroupListItem key={group.id} group={group} />
      ))}
    </div>
  );
};
