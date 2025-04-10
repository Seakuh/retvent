import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../../utils";
import { ChatWindow } from "./ChatWindow";
import { getGroupChat, sendMessage } from "./service";

export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const messages = await getGroupChat(groupId || "");
      setMessages(messages);
    };
    fetchMessages();
  }, [groupId]);

  const onSend = async (message: string) => {
    const newMessage = await sendMessage(groupId || "", message);
    setMessages([...messages, newMessage]);
  };

  return (
    (group && (
      <div>
        GroupChat
        <ChatWindow messages={messages} onSend={onSend} />
      </div>
    )) || <div>Group not found</div>
  );
};
