import { API_URL, Group, SendMessageDto } from "../../utils";

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

export const getGroup = async (groupId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}groups/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data;
};

export const sendMessage = async (
  groupId: string,
  message: string,
  file?: File,
  latitude?: number,
  longitude?: number
) => {
  const token = localStorage.getItem("access_token");
  const sendMessageDto: SendMessageDto = {
    groupId: groupId,
    content: message,
  };
  if (file) {
    sendMessageDto.file = file;
    sendMessageDto.type = "image";
  }
  if (latitude && longitude) {
    sendMessageDto.latitude = latitude;
    sendMessageDto.longitude = longitude;
    sendMessageDto.type = "location";
  }
  console.log(sendMessageDto);
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

const addMember = async (groupId: string, userId: string) => {
  const response = await fetch(`${API_URL}groups/${groupId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
};

// @Post('/leave/:groupId')
// @UseGuards(JwtAuthGuard)
// leaveGroup(@Req() req, @Param('groupId') groupId: string) {
//   return this.groupService.leaveGroup(req.user.id, groupId);
// }

export const leaveGroup = async (group: Group) => {
  const token = localStorage.getItem("access_token");
  console.log("groupId", group._id);
  console.log("token", token);

  const response = await fetch(`${API_URL}groups/leave/${group._id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json", // Content-Type Header hinzugefügt
    },
  });
  const data = await response.json();
  return data;
};
