import React, { useState } from 'react';
import { SearchBar } from './components/SearchBar/SearchBar';
import { EventList } from './components/EventList/EventList';
import { EventForm } from './components/EventForm/EventForm';
import { MapView } from './components/MapView/MapView';
import { ViewToggle } from './components/ViewToggle/ViewToggle';
import { CategoryFilter } from './components/CategoryFilter/CategoryFilter';
import { searchEvents } from './services/eventService';
import { Event, ViewMode } from './types/event';
import { CalendarDays, PlusCircle, Menu, Heart } from 'lucide-react';

const mockEvents: Event[] = [
  {
    id: '135',
    name: '90s Retro Party',
    date: '2024-03-20T20:00:00',
    location: 'Neon Club Berlin',
    description: 'The ultimate 90s experience with the best music from the decade!',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    category: 'Party',
    price: '25€',
    latitude: 52.52,
    longitude: 13.405
  },
  {
    id: '1',
    name: 'Tech Startups Meetup',
    date: '2024-04-10T18:00:00',
    location: 'Factory Berlin',
    description: 'Networking und Vorträge für Gründer und Technologie-Enthusiasten',
    imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1',
    category: 'Networking',
    price: 'Kostenlos',
    latitude: 52.520,
    longitude: 13.405
  },
  {
    id: '2',
    name: 'Open Air Techno Festival',
    date: '2024-06-15T20:00:00',
    location: 'Sisyphos Berlin',
    description: 'Elektronische Beats unter freiem Himmel mit internationalen DJs',
    imageUrl: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4',
    category: 'Musik',
    price: '30€',
    latitude: 52.515,
    longitude: 13.470
  },
  {
    id: '4',
    name: 'Berliner Streetfood Festival',
    date: '2024-05-05T12:00:00',
    location: 'RAW Gelände',
    description: 'Entdecke Streetfood aus aller Welt in einer einzigartigen Atmosphäre',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    category: 'Essen',
    price: 'Eintritt frei',
    latitude: 52.512,
    longitude: 13.453
  },
  {
    id: '5',
    name: 'Kunst im Bunker – Ausstellung',
    date: '2024-04-20T17:00:00',
    location: 'Boros Bunker',
    description: 'Zeitgenössische Kunst in einem historischen Weltkriegsbunker',
    imageUrl: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf',
    category: 'Kunst',
    price: '15€',
    latitude: 52.529,
    longitude: 13.383
  },
  {
    id: '6',
    name: 'Vintage Klamottenmarkt',
    date: '2024-03-30T11:00:00',
    location: 'Berliner Flohmarkt',
    description: 'Ein Paradies für Vintage-Fans mit Second-Hand Mode und Retro-Fundstücken',
    imageUrl: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664',
    category: 'Shopping',
    price: 'Eintritt frei',
    latitude: 52.530,
    longitude: 13.401
  },
  {
    id: '3',
    name: 'Vintage Gaming Convention',
    date: '2024-03-25T15:00:00',
    location: 'Retro Arena',
    description: 'Experience the golden age of gaming with classic consoles and arcade machines',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    category: 'Gaming',
    price: '20€',
    latitude: 52.515,
    longitude: 13.395
  },
  {
    id: '2456',
    name: 'Techno Underground',
    date: '2024-03-22T22:00:00',
    location: 'Basement Club',
    description: 'Deep electronic beats in an authentic underground atmosphere',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819',
    category: 'Music',
    price: '15€',
    latitude: 52.51,
    longitude: 13.41
  },
];

function App() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [loading, setLoading] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = async (keyword: string) => {
    setLoading(true);
    try {
      const filteredMockEvents = mockEvents.filter(event => 
        event.name.toLowerCase().includes(keyword.toLowerCase()) ||
        event.description.toLowerCase().includes(keyword.toLowerCase())
      );
      setEvents(filteredMockEvents);
      
      const results = await searchEvents({ keyword });
      setEvents([...filteredMockEvents, ...results]);
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      console.log('Creating event:', eventData);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const filteredEvents = events
    .filter(event => !selectedCategory || event.category === selectedCategory)
    .filter(event => !showFavorites || favorites.has(event.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000046] to-[#1CB5E0]">
      <header className="glass-effect sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
            <h1 className="text-3xl font-bold text-white neon-text"></h1>
            </div>
            <div className="flex items-center gap-4">
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg glass-effect text-white"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
          
          {showMenu && (
            <div className="absolute right-4 mt-2 w-48 glass-effect rounded-lg shadow-lg py-2">
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10"
              >
                <Heart size={20} />
                {showFavorites ? 'Show All Events' : 'Show Favorites'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-pink"></div>
            </div>
          ) : viewMode === 'list' ? (
            <EventList 
              events={filteredEvents}
              onToggleFavorite={toggleFavorite}
              onAddToCalendar={(event) => console.log('Add to calendar:', event)}
              favorites={favorites}
            />
          ) : (
            <MapView 
              events={filteredEvents}
              onMarkerClick={(event) => console.log('Clicked event:', event)}
            />
          )}
        </div>

        <button
          onClick={() => setShowEventForm(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-6 py-3 glass-effect text-white rounded-full hover:bg-white/10 transition-colors neon-shadow"
        >
          <PlusCircle size={24} />
          Add Event
        </button>

        {showEventForm && (
          <EventForm
            onSubmit={handleCreateEvent}
            onClose={() => setShowEventForm(false)}
          />
        )}
      </main>
    </div>
  );
}

export default App;