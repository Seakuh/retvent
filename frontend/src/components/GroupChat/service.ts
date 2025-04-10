import { API_URL, SendMessageDto } from "../../utils";

export const getGroups = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/my-groups`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const getGroupChat = async (groupId: string) => {
  const token = localStorage.getItem("access_token");
  console.log(groupId);
  const response = await fetch(`${API_URL}messages/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const sendMessage = async (groupId: string, message: string) => {
  const token = localStorage.getItem("access_token");
  const sendMessageDto: SendMessageDto = {
    groupId: groupId,
    content: message,
  };
  const response = await fetch(`${API_URL}messages/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // Content-Type Header hinzugefügt
    },
    body: JSON.stringify(sendMessageDto),
  });
  const data = await response.json();
  return data;
};
