import { Event } from "../types/event";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchEvents(lat: number, lon: number, radius: number) {
  try {
    const response = await fetch(
      `${API_URL}/api/events?lat=${lat}&lon=${lon}&radius=${radius}`
    );
    if (!response.ok) throw new Error("Fehler beim Abrufen der Events");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMockEvents(lat: number, lon: number, radius: number) {
  try {
    // Mock-Daten für Events auf Koh Phangan
    const mockEvents = [
      {
        id: "1",
        name: "Full Moon Party",
        date: "2025-02-10",
        location: "Haad Rin Beach, Koh Phangan",
        description: "Legendäre Strandparty mit DJs und Feuer-Shows!",
        imageUrl: "https://images.vartakt.com/images/1ac7ecd5-a729-49db-86fb-4ffe95f93a98.png",
        category: "Party",
        price: "500 THB",
        latitude: 9.6755,
        longitude: 100.0631,
        ticketUrl: "https://fullmoonparty.com/tickets"
      },
      {
        id: "2",
        name: "Yoga & Meditation Retreat",
        date: "2025-02-15",
        location: "The Sanctuary, Koh Phangan",
        description: "Ein entspannendes Retreat für Körper & Geist.",
        imageUrl: "https://images.vartakt.com/images/1ac7ecd5-a729-49db-86fb-4ffe95f93a98.png",
        category: "Wellness",
        price: "1200 THB",
        latitude: 9.6804,
        longitude: 100.0679,
        ticketUrl: "https://thesanctuary.com/book"
      },
      {
        id: "3",
        name: "Tech House Beach Party",
        date: "2025-02-20",
        location: "Secret Beach, Koh Phangan",
        description: "Tech House & Deep House am Strand mit Top-DJs!",
        imageUrl: "https://images.vartakt.com/images/1ac7ecd5-a729-49db-86fb-4ffe95f93a98.png",
        category: "Music",
        price: "800 THB",
        latitude: 9.7105,
        longitude: 100.0552,
        ticketUrl: "https://secretbeachparty.com/tickets"
      },
      {
        id: "4",
        name: "Sunset Live Music",
        date: "2025-02-25",
        location: "Amsterdam Bar, Koh Phangan",
        description: "Live Bands spielen zum Sonnenuntergang.",
        imageUrl: "https://images.vartakt.com/images/1ac7ecd5-a729-49db-86fb-4ffe95f93a98.png",
        category: "Live Music",
        price: "Free Entry",
        latitude: 9.7036,
        longitude: 100.0389,
        ticketUrl: "https://amsterdambar.com/events"
      },
      {
        id: "5",
        name: "Koh Phangan Food Festival",
        date: "2025-03-01",
        location: "Thong Sala, Koh Phangan",
        description: "Das größte Food Festival mit lokalen Spezialitäten!",
        imageUrl: "https://images.vartakt.com/images/1ac7ecd5-a729-49db-86fb-4ffe95f93a98.png",
        category: "Food",
        price: "Free Entry",
        latitude: 9.7144,
        longitude: 100.0157,
        ticketUrl: "https://phanganfoodfest.com"
      }
    ];

    return mockEvents;
  } catch (error) {
    console.error(error);
    return [];
  }
}


export async function fetchCoordinates(locationName: string) {
  try {
    const response = await fetch(`${API_URL}/api/location?name=${encodeURIComponent(locationName)}`);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Koordinaten");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const fetchUserUpcomingEvents = async () => {
  return [
    {
      _id: '1',
      id: '1',
      name: 'Tech Meetup',
      date: '2025-02-15',
      location: 'Berlin',
      description: 'A meetup for tech enthusiasts.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Tech',
      price: 'Free',
      latitude: 52.52,
      longitude: 13.405,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/tech-meetup'
    },
    {
      _id: '2',
      id: '2',
      name: 'Music Festival',
      date: '2025-03-10',
      location: 'Hamburg',
      description: 'Enjoy live music and performances.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Music',
      price: '50€',
      latitude: 53.5511,
      longitude: 9.9937,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/music-festival'
    }
  ];
};

export const fetchLocationUpcomingEvents = async () => {
  return [
    {
      _id: '3',
      id: '3',
      name: 'Art Exhibition',
      date: '2025-04-05',
      location: 'Munich',
      description: 'A modern art exhibition.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Art',
      price: '10€',
      latitude: 48.1351,
      longitude: 11.582,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/art-exhibition'
    },
    {
      _id: '3',
      id: '3',
      name: 'Art Exhibition',
      date: '2025-04-05',
      location: 'Munich',
      description: 'A modern art exhibition.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Art',
      price: '10€',
      latitude: 48.1351,
      longitude: 11.582,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/art-exhibition'
    },
    {
      _id: '3',
      id: '3',
      name: 'Art Exhibition',
      date: '2025-04-05',
      location: 'Munich',
      description: 'A modern art exhibition.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Art',
      price: '10€',
      latitude: 48.1351,
      longitude: 11.582,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/art-exhibition'
    },
    {
      _id: '3',
      id: '3',
      name: 'Art Exhibition',
      date: '2025-04-05',
      location: 'Munich',
      description: 'A modern art exhibition.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Art',
      price: '10€',
      latitude: 48.1351,
      longitude: 11.582,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/art-exhibition'
    },
    {
      _id: '4',
      id: '4',
      name: 'Startup Pitch Night',
      date: '2025-05-20',
      location: 'Cologne',
      description: 'Pitch your startup idea to investors.',
      imageUrl: 'https://via.placeholder.com/150',
      category: 'Startups',
      price: 'Free',
      latitude: 50.9375,
      longitude: 6.9603,
      uploa: undefined,
      uploadL: undefined,
      ticketUrl: 'https://event.com/startup-pitch'
    }
  ];
};

export const createEvent = async (event : Event) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
};
