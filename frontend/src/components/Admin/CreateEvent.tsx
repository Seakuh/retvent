import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../../services/event.service';
import { LocationService, Location } from '../../services/location.service';
import './CreateEvent.css';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const eventService = new EventService();
  const locationService = new LocationService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  // const [locations, setLocations] = useState<Location[]>([]);
  
  const [eventData, setEventData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    // locationId: '',
    description: '',
    price: '',
    ticketUrl: ''
  });

  // useEffect(() => {
  //   fetchLocations();
  // }, []);

  // const fetchLocations = async () => {
  //   try {
  //     const locationData = await locationService.getLocations();
  //     setLocations(locationData);
  //   } catch (error) {
  //     setError('Failed to load locations 😢');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await eventService.createEvent(eventData, image || undefined);
      navigate('/admin/events');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event 😢');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="create-event-container">
      <div className="header-container">
        <button onClick={handleBack} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Create New Event 🎪</h1>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-left">
            <div className="dropzone">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <div className="dropzone-content">
                  <p>Click to select an image 📸</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-right">
            <input
              type="text"
              placeholder="Event Title"
              value={eventData.title}
              onChange={(e) => setEventData({...eventData, title: e.target.value})}
              required
            />

            <div className="date-time-group">
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                required
              />
              <input
                type="time"
                value={eventData.startTime}
                onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
                required
              />
            </div>

            {/* <select
              value={eventData.locationId}
              onChange={(e) => setEventData({...eventData, locationId: e.target.value})}
              required
              className="location-select"
            >
              <option value="">Select Location 📍</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.address}
                </option>
              ))}
            </select> */}

            <textarea
              placeholder="Description"
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              required
            />

            <input
              type="text"
              placeholder="Price (optional)"
              value={eventData.price}
              onChange={(e) => setEventData({...eventData, price: e.target.value})}
            />

            <input
              type="url"
              placeholder="Ticket URL (optional)"
              value={eventData.ticketUrl}
              onChange={(e) => setEventData({...eventData, ticketUrl: e.target.value})}
            />

            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Creating... ⏳' : 'Create Event 🚀'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent; 