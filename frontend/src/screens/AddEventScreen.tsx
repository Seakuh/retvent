import React, { useState, useEffect } from "react";
import "./AddEventScreen.css";
import { create, createEvent } from "./service";

const AddEventScreen: React.FC = () => {
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

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEventData({ ...eventData, image: e.target.files[0] });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(eventData);
      alert("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event.");
    }
  };

  return (
    <div className="add-event-screen">
      <h2>Create a New Event</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Event Name" onChange={handleChange} required />
        <input type="datetime-local" name="date" onChange={handleChange} required />
        <input type="text" name="location" placeholder="Location" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
        <input type="text" name="category" placeholder="Category (optional)" onChange={handleChange} />
        <input type="text" name="price" placeholder="Price (optional)" onChange={handleChange} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default AddEventScreen;
