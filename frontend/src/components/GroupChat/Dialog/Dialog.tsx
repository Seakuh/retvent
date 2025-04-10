import React from "react";
import "./Dialog.css";

// Definieren der Props für Dialog
interface DialogProps {
  messages: { text: string; isUser: boolean }[];
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

const Dialog: React.FC<DialogProps> = ({ messages, onSend, loading }) => {
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

  return (
    <div className="dialog-container">
      <div className="dialog-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.isUser ? "user-message" : "bot-message"}`}
          >
            {msg.text}
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
          <i className="arrow-up"></i>
        </button>
      </div>
    </div>
  );
};

export default Dialog;
