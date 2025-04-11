import { Send } from "lucide-react";
import React, { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL, Message } from "../../../utils";
import "./Dialog.css";
// Definieren der Props für Dialog
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
  const userId = localStorage.getItem("userId");
  const [input, setInput] = React.useState("");
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    // Socket.io Client initialisieren
    const token = localStorage.getItem("access_token");
    const newSocket = io(API_URL, {
      // Hier nur API_URL ohne /messages
      auth: {
        token: token,
      },
      path: "/socket.io/", // Standard Socket.IO Pfad
      transports: ["websocket", "polling"], // Explizit die Transportmethoden angeben
    });

    // Socket Event Listener
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      // Der Gruppe beitreten
      newSocket.emit("joinGroup", groupId);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
    });

    newSocket.on("newMessage", (message: Message) => {
      // Hier können Sie die neue Nachricht verarbeiten
      console.log("Message from socket:", message);
      // Aktualisieren Sie Ihre Messages-State hier
    });

    newSocket.on("errorMessage", (error: string) => {
      console.error("WebSocket Error:", error);
    });

    setSocket(newSocket);

    // Cleanup beim Unmount
    return () => {
      newSocket.close();
    };
  }, [groupId]);

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
