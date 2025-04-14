import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Group, Message } from "../../utils";
import { ChatHeader } from "./ChatHeader";
import { useChat } from "./chatProvider";
import { ChatWindow } from "./ChatWindow";
import "./GroupChat.css";
import { getGroup, getGroupChat, sendMessage } from "./service";
export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { setCurrentGroup, setCurrentEvent } = useChat();
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
        setCurrentGroup(groupData);
        setCurrentEvent(groupData.eventId!);
      } catch (error) {
        console.error("Error loading data:", error);
        // Could add an error state here
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  const onSend = async (message: string, file?: File) => {
    try {
      const newMessage = await sendMessage(groupId || "", message, file);
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
      <ChatWindow messages={messages} onSend={onSend} group={group} />
    </div>
  );
};
