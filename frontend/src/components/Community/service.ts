import { Community, EventType, Role } from "../../utils";

export const getCommunity = async (communitySlug: string) => {
  //const response = await fetch(`${API_URL}communities/${communityId}`);
  // const data = await response.json();
  return exampleCommunity;
};

const exampleCommunity: Community = {
  id: "comm-001",
  name: "VI-Poker Community",
  slug: "vi-poker",
  description: "Poker, Lernen & Networking auf drei Ebenen.",
  coverImageUrl: "/images/poker-cover.jpg",
  createdAt: new Date().toISOString(),

  members: [
    {
      id: "u1",
      name: "Anna",
      role: Role.ADMIN,
      joinedAt: "2025-09-01T12:00:00Z",
    },
    {
      id: "u2",
      name: "Tom",
      role: Role.USER,
      joinedAt: "2025-09-10T15:00:00Z",
    },
  ],

  events: [
    {
      id: "e1",
      title: "Workshop: Entscheidungsstrategien im Poker",
      description: "Von Intuition zu Statistik.",
      type: EventType.WORKSHOP,
      location: {
        type: "point",
        coordinates: [11.576124, 48.137154],
        city: "München",
      },
      startAt: "2025-11-05T18:00:00Z",
      endAt: "2025-11-05T21:00:00Z",
      hostId: "u1",
      attendees: ["u1", "u2"],
      host: {
        username: "Anna",
        profileImageUrl: "/images/anna.jpg",
      },
      imageUrl: "/images/poker-workshop.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  news: [
    {
      id: "n1",
      title: "VI-Poker startet mit erstem Workshop!",
      content: "Am 5. November treffen wir uns in München...",
      authorId: "u1",
      createdAt: "2025-10-12T09:00:00Z",
      comments: [
        {
          id: "c1",
          authorId: "u2",
          content: "Mega, ich bin dabei! 🎉",
          createdAt: "2025-10-12T10:00:00Z",
          text: "Mega, ich bin dabei! 🎉",
          eventId: "e1",
        },
      ],
    },
  ],

  partners: [
    {
      id: "p1",
      name: "Computermichel",
      logoUrl: "/logos/computermichel.svg",
      linkUrl: "https://computermichel.de",
    },
  ],
};
