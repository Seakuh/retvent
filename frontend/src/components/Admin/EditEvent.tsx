import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventService } from '../../services/event.service';
import './EditEvent.css';

interface EditEventDto {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  city: string;
  category: string;
  price: string;
}

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventService = new EventService();

  const [formData, setFormData] = useState<EditEventDto>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    city: '',
    category: '',
    price: '',
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const event = await eventService.getEventById(eventId!);
      setFormData({
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        startTime: event.startTime,
        city: event.city,
        category: event.category,
        price: event.price,
      });
    } catch (err) {
      setError('Failed to fetch event details 😢');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await eventService.updateEvent(eventId!, formData);
      navigate('/admin/events');
    } catch (err) {
      setError('Failed to update event 😢');
    }
  };

  if (loading) return <div className="loading">Loading event details... ⌛</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-event-container">
      <h2>Edit Event ✏️</h2>
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="form-group">
          <label htmlFor="title">Title 📝</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description 📄</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Date 📅</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Time ⏰</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City 🏙️</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price 💰</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category 🏷️</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            <option value="music">Music 🎵</option>
            <option value="sports">Sports ⚽</option>
            <option value="arts">Arts 🎨</option>
            <option value="food">Food 🍔</option>
            <option value="other">Other 📦</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/events')} className="cancel-btn">
            Cancel ❌
          </button>
          <button type="submit" className="save-btn">
            Save Changes 💾
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 