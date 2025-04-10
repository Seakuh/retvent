import { Group, Message } from "../../utils";
import Dialog from "./Dialog/Dialog";

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  group?: Group;
}

export const ChatWindow = ({ messages, onSend }: ChatWindowProps) => {
  return (
    <div className="chat-window">
      <Dialog
        messages={messages}
        onSend={onSend}
        loading={false}
        title="Chat"
        description="Chat with the group"
      />
    </div>
  );
};
