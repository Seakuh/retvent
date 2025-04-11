import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Group } from "../../utils";
import { ChatHeader } from "./ChatHeader";
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
    <div className="group-chat-page">
      <ChatHeader
        group={{
          id: "1",
          name: "Chats",
          description: "Group 1 description",
          memberIds: [],
        }}
      />
      {groups.map((group) => (
        <GroupListItem key={group.id} group={group} />
      ))}
    </div>
  );
};
