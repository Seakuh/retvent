import { MessageCircleDashed } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../contexts/UserContext";
import { Group } from "../../utils";
import { ChatHeader } from "./ChatHeader";
import "./GroupChatPage.css";
import { GroupListItem } from "./GroupListItem";
import { getGroups } from "./service";
export const GroupChatPage = () => {
  const user = useContext(UserContext);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      const groups = await getGroups();
      setGroups(groups);
    };
    fetchGroups();
  }, []);

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
      <div className="group-chat-page-content">
        {groups.length === 0 ? (
          <div className="no-groups">
            <div className="no-groups">
              <MessageCircleDashed size={100} />
              You have not joined any groups yet.
            </div>
          </div>
        ) : (
          groups.map((group) => <GroupListItem key={group.id} group={group} />)
        )}
      </div>
    </div>
  );
};
