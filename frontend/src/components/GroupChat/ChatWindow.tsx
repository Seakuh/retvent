import { Group, Message } from "../../utils";
import Dialog from "./Dialog/Dialog";

interface ChatWindowProps {
  messages: Message[];
  onSend: (message: string, file?: File) => Promise<void>;
  group?: Group;
}

export const ChatWindow = ({ messages, onSend, group }: ChatWindowProps) => {
  console.log(group);
  return (
    <div className="chat-window">
      <Dialog
        messages={messages}
        onSend={onSend}
        loading={false}
        title={group?.name}
        description={group?.description}
      />
    </div>
  );
};
