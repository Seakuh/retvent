import { API_URL } from "../../utils";

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

// @Get(':groupId')
// @UseGuards(GroupGuard)
// async getMessagesWithGuard(@Req() req, @Param('groupId') groupId: string) {

export const getGroupChat = async (groupId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/${groupId}/chat`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const sendMessage = async (groupId: string, message: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/${groupId}/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  return data;
};
