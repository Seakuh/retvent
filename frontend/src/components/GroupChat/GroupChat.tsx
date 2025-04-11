import { ChevronLeft, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Group, Message } from "../../utils";
import { ChatWindow } from "./ChatWindow";
import "./GroupChat.css";
import { getGroup, getGroupChat, sendMessage } from "./service";

export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [groupData, messagesData] = await Promise.all([
          getGroup(groupId || ""),
          getGroupChat(groupId || ""),
        ]);
        setGroup(groupData);
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading data:", error);
        // Could add an error state here
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  const onSend = async (message: string) => {
    try {
      const newMessage = await sendMessage(groupId || "", message);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className="group-chat-container">
      <ChatHeader group={group} />
      <ChatWindow
        messages={messages}
        onSend={onSend}
        group={group}
        searchTerm={null}
      />
    </div>
  );
};

const ChatHeader = ({ group }: { group: Group }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="chat-header">
      <button onClick={handleBack} className="back-button-group-header">
        <ChevronLeft className="h-6 w-6" />
      </button>
      <div className="chat-header-name">{group.name}</div>
      {/* <div
        className="search-bar"
        onClick={() => {
          searchMessages();
        }}
      >
        <Search className="h-6 w-6" />
      </div> */}
      <div className="more">
        <MoreVertical className="h-6 w-6" />
      </div>
    </div>
  );
};
