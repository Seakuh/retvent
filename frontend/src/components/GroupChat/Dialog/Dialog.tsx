import { Send } from "lucide-react";
import React from "react";
import { Message } from "../../../utils";
import "./Dialog.css";
// Definieren der Props für Dialog
interface DialogProps {
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

const Dialog: React.FC<DialogProps> = ({ messages, onSend, loading }) => {
  const userId = localStorage.getItem("userId");
  const [input, setInput] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Verhindert den Zeilenumbruch bei Enter
      handleSendMessage();
    } else if (e.key === "Enter" && e.shiftKey) {
      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; // Dynamische Größe
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Reset textarea height after sending
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.style.height = "auto";

    await onSend(input); // Nachricht senden
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
      return "Gestern";
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
        {messages.map((msg, index) => (
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
      </div>
      <div className="dialog-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          rows={1}
        />
        <button onClick={handleSendMessage} className="send-button">
          <Send className="send-icon" size={24} />
        </button>
      </div>
    </div>
  );
};

export default Dialog;
