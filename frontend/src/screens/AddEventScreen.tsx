import React, { useState, useEffect } from "react";
import "./AddEventScreen.css";
import { create } from "./service";
import ImageUpload from "../components/ImageUpload";
import UploadedEventCard from "../components/UploadedEventCard/UploadedEventCard";
import { CategoryFilter } from "../components/CategoryFilter/CategoryFilter";

const AddEventScreen: React.FC = () => {
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [eventData, setEventData] = useState({
    name: "",
    date: "",
    location: "",
    description: "",
    category: "",
    price: "",
    image: null as File | null,
    eventLat: null as number | null,
    eventLon: null as number | null,
  });

  // Fetch user's location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setEventData((prevData) => ({
          ...prevData,
          eventLat: position.coords.latitude,
          eventLon: position.coords.longitude,
        }));
      },
      (error) => console.error("Geolocation error:", error)
    );
  }, []);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  // Handle category change (Fix: Aktualisiert eventData)
  const handleCategoryChange = (category: string | null) => {
    const selected = category || "All"; // Falls category null ist, wird "All" gesetzt
    setSelectedCategory(selected);
    setEventData((prevData) => ({ ...prevData, category: selected })); // Speichert die Kategorie korrekt
  };
  

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const event = await create(eventData);
      setUploadedEvent(event);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
    setIsUploading(false);
  };

  return (
    <div className="add-event-screen">
      <form onSubmit={handleSubmit}>
        <ImageUpload onFileSelect={(file) => setEventData({ ...eventData, image: file })} />
        <input type="text" name="name" placeholder="Event Name" onChange={handleChange} required />
        <input type="datetime-local" name="date" onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
        <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
        <input type="text" name="price" placeholder="Price (optional)" onChange={handleChange} />
        <button type="submit">Create Event</button>
      </form>
      {/* Hochgeladenes Event in Fullscreen anzeigen */}
      {uploadedEvent && <UploadedEventCard event={uploadedEvent} onClose={() => setUploadedEvent(null)} isUploading={false} />}
    </div>
  );
};

export default AddEventScreen;
