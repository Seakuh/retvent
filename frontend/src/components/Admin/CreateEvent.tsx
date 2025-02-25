import React, { useState } from 'react';
import './Admin.css';

const CreateEvent: React.FC = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    city: '',
    category: '',
    price: '',
    ticketLink: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        alert('Event created successfully! 🎉');
        setEventData({
          title: '',
          description: '',
          startDate: '',
          startTime: '',
          city: '',
          category: '',
          price: '',
          ticketLink: ''
        });
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  return (
    <div className="create-event-container">
      <h2>Create New Event 🎪</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={eventData.title}
          onChange={(e) => setEventData({...eventData, title: e.target.value})}
        />
        <textarea
          placeholder="Event Description"
          value={eventData.description}
          onChange={(e) => setEventData({...eventData, description: e.target.value})}
        />
        <input
          type="date"
          value={eventData.startDate}
          onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
        />
        <input
          type="time"
          value={eventData.startTime}
          onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
        />
        <input
          type="text"
          placeholder="City"
          value={eventData.city}
          onChange={(e) => setEventData({...eventData, city: e.target.value})}
        />
        <select
          value={eventData.category}
          onChange={(e) => setEventData({...eventData, category: e.target.value})}
        >
          <option value="">Select Category</option>
          <option value="music">Music</option>
          <option value="sports">Sports</option>
          <option value="arts">Arts</option>
          <option value="technology">Technology</option>
        </select>
        <input
          type="text"
          placeholder="Price"
          value={eventData.price}
          onChange={(e) => setEventData({...eventData, price: e.target.value})}
        />
        <button type="submit">Create Event 🚀</button>
      </form>
    </div>
  );
};

export default CreateEvent; 