import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Group, Message } from "../../utils";
import { ChatWindow } from "./ChatWindow";
import { getGroupChat, sendMessage } from "./service";

export const GroupChat: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    console.log(groupId);
    const fetchMessages = async () => {
      const messages = await getGroupChat(groupId || "");
      setMessages(messages);
    };
    fetchMessages();
  }, [groupId]);

  const onSend = async (message: string) => {
    const newMessage = await sendMessage(groupId || "", message);
    console.log(newMessage);
    setMessages([...messages, newMessage]);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <ChatWindow messages={messages} onSend={onSend} group={group} />
    </div>
  );
};
