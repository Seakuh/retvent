import { Event } from '../../core/domain/event';

export const kohPhanganEvents = [
  {
    title: "Full Moon Party",
    description: "The famous monthly full moon party at Haad Rin beach",
    category: "Party",
    date: new Date("2024-03-24"),
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
    location: {
      name: "Haad Rin Beach",
      coordinates: {
        lat: 9.6809,
        lng: 100.0684
      }
    }
  },
  
  {
    title: "Yoga at Zen Beach",
    description: "Morning yoga session with ocean view",
    category: "Wellness",
    date: new Date("2024-03-20"),
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
    location: {
      name: "Zen Beach",
      coordinates: {
        lat: 9.7784,
        lng: 100.0200
      }
    }
  },
  {
    title: "Muay Thai Championship",
    description: "Local Thai boxing championship",
    category: "Sports",
    date: new Date("2024-03-22"),
    imageUrl: "https://images.unsplash.com/photo-1544117519-31a4b719223d",
    location: {
      name: "Diamond Muay Thai",
      coordinates: {
        lat: 9.7473,
        lng: 100.0323
      }
    }
  }
]; 