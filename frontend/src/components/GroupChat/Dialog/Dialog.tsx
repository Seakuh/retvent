import { Image, MapPin, Send } from "lucide-react";
import React, { useContext, useEffect } from "react";
import { Socket } from "socket.io-client";
import { UserContext } from "../../../contexts/UserContext";
import { Message } from "../../../utils";
import { useChat } from "../chatProvider";
import "./Dialog.css";
interface DialogProps {
  messages: Message[];
  onSend: (
    message: string,
    file?: File,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
  loading: boolean;
  groupId: string; // Neue Prop für die Gruppen-ID
}

const Dialog: React.FC<DialogProps> = ({
  messages,
  onSend,
  loading,
  groupId,
}) => {
  const { user } = useContext(UserContext);
  const { currentGroupId } = useChat();
  const userId = user?.id;
  const [input, setInput] = React.useState("");
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
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

  const handleSendLocation = async () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      await onSend("", undefined, latitude, longitude);
    });
  };

  const handleSendImage = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onSend("", file); // Leerer String als Nachricht, File als zweiter Parameter
      }
    };
    fileInput.click();
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

              {/* Textnachricht */}
              {(!msg.messageType || msg.messageType === "text") && (
                <div className="message-content">{msg.content}</div>
              )}

              {/* Standortnachricht */}
              {msg.type === "location" && msg.latitude && msg.longitude && (
                <div className="location-message">
                  <img
                    src={`https://tile.openstreetmap.org/15/${Math.floor(
                      ((msg.longitude + 180) / 360) * Math.pow(2, 15)
                    )}/${Math.floor(
                      ((1 -
                        Math.log(
                          Math.tan((msg.latitude * Math.PI) / 180) +
                            1 / Math.cos((msg.latitude * Math.PI) / 180)
                        ) /
                          Math.PI) /
                        2) *
                        Math.pow(2, 15)
                    )}.png`}
                    alt="Standort"
                    className="dialog-map-message rounded-lg cursor-pointer hover:opacity-90 transition-opacity w-[400px] h-[200px] object-cover"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`,
                        "_blank"
                      )
                    }
                  />
                </div>
              )}

              {/* Bildnachricht */}
              {msg.fileUrl && (
                <div className="image-message">
                  <img
                    src={msg.fileUrl}
                    alt="Bild"
                    className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(msg.fileUrl || "")}
                  />
                </div>
              )}
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
          <button onClick={handleSendImage} className="send-button">
            <Image className="send-icon" size={24} />
          </button>
          <button onClick={handleSendLocation} className="send-button">
            <MapPin className="send-icon" size={24} />
          </button>
          <button onClick={handleSendMessage} className="send-button">
            <Send className="send-icon" size={24} />
          </button>
        </div>
      </div>
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Bigger Image"
            className="max-w-[90%] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Dialog;
