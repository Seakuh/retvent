import React, { createContext, useContext, useState } from "react";
import { Group } from "../../utils";

interface Message {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: Record<string, Message[]>;
  groups: Group[];
  currentGroupId: string | null;
  currentEventId: string | null;
  sendMessage: (groupId: string, content: string) => Promise<void>;
  setCurrentGroup: (groupId: string) => void;
  setCurrentEvent: (eventId: string) => void;
  loadMessages: (groupId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const loadMessages = async (groupId: string) => {
    try {
      // Hier API-Aufruf zum Laden der Nachrichten implementieren
      const response = await fetch(`/api/groups/${groupId}/messages`);
      const groupMessages = await response.json();
      setMessages((prev) => ({
        ...prev,
        [groupId]: groupMessages,
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (groupId: string, content: string) => {
    try {
      // Hier API-Aufruf zum Senden einer Nachricht implementieren
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const newMessage = await response.json();

      setMessages((prev) => ({
        ...prev,
        [groupId]: [...(prev[groupId] || []), newMessage],
      }));
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
    }
  };

  const setCurrentGroup = (groupId: string) => {
    console.log("setCurrentGroup", groupId);
    setCurrentGroupId(groupId);
    loadMessages(groupId);
  };

  const setCurrentEvent = (eventId: string) => {
    setCurrentEventId(eventId);
  };

  const value = {
    messages,
    groups,
    currentGroupId,
    currentEventId,
    setCurrentEvent,
    sendMessage,
    setCurrentGroup,
    loadMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook für einfachen Zugriff auf den ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
