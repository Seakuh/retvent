import { Send } from "lucide-react";
import React, { useContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { UserContext } from "../../../contexts/UserContext";
import { Message } from "../../../utils";
import { useChat } from "../chatProvider";
import "./Dialog.css";
interface DialogProps {
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  loading: boolean;
  groupId: string; // Neue Prop für die Gruppen-ID
}

const Dialog: React.FC<DialogProps> = ({
  messages,
  onSend,
  loading,
  groupId,
}) => {
  const { user, loggedIn, setLoggedIn } = useContext(UserContext);
  const { currentGroupId } = useChat();

  const userId = user?.id;
  const [input, setInput] = React.useState("");
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scrollt nach unten wenn neue Nachrichten ankommen

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Verhindert den Zeilenumbruch bei Enter
      handleSendMessage();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; // Dynamische Größe
    }
  };

  const handleImageUpload = () => {
    console.log("Image upload");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Reset textarea height after sending
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.style.height = "auto";

    if (socket) {
      // Nachricht über WebSocket senden
      socket.emit("sendMessage", {
        groupId: groupId,
        senderId: userId,
        content: input,
      });
    }

    await onSend(input);
    setInput("");
  };

  const toTime = (date: Date | undefined) => {
    if (!date) return "";

    const dateObj = new Date(date);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toLocaleDateString() === now.toLocaleDateString()) {
      // Today - show only time
      return dateObj.toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (
      dateObj.toLocaleDateString() === yesterday.toLocaleDateString()
    ) {
      // Yesterday
      return "yesterday";
    } else {
      // Other days - show day and month
      return dateObj.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return (
    <div className="dialog-container">
      <div className="dialog-messages">
        {messages
          .sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            // Sortiere aufsteigend (älteste zuerst)
            return dateA.getTime() - dateB.getTime();
          })
          .map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.senderId === userId ? "user-message" : "bot-message"
              }`}
            >
              <div className="message-timestamp">
                {toTime(msg.createdAt || new Date())}
              </div>
              {msg.content}
            </div>
          ))}
        {loading && (
          <div className="loading">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}
        <div ref={messagesEndRef} />{" "}
        {/* Scroll-Anker am Ende der Nachrichten */}
      </div>
      <div className="dialog-input-container">
        <div className="dialog-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message"
            rows={1}
          />
          {/* <button onClick={handleImageUpload} className="send-button">
            <Image className="send-icon" size={24} />
          </button> */}
          <button onClick={handleSendMessage} className="send-button">
            <Send className="send-icon" size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
