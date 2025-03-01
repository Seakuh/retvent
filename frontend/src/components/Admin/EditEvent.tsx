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
  imageUrl?: string;
}

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const eventService = new EventService();

  const [formData, setFormData] = useState<EditEventDto>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    city: '',
    category: '',
    price: '',
    imageUrl: '',
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
        imageUrl: event.imageUrl,
      });
      if (event.imageUrl) {
        setImagePreview(event.imageUrl);
      }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && key !== 'imageUrl') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Append new image if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      await eventService.updateEvent(eventId!, formDataToSend);
      navigate('/admin/events');
    } catch (err) {
      setError('Failed to update event 😢');
    }
  };

  const handleBack = () => {
    navigate('/admin/events');
  };

  if (loading) return <div className="loading">Loading event details... ⌛</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-event-container">
         <button onClick={handleBack} className="back-button">
          ← Back to Events
        </button>
      <h2>Edit Event ✏️</h2>
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="image-upload-section">
          <div className="current-image">
            {imagePreview ? (
              <img src={imagePreview} alt="Event preview" className="image-preview" />
            ) : (
              <div className="no-image">No image selected 🖼️</div>
            )}
          </div>
          <div className="image-upload-controls">
            <label htmlFor="image" className="image-upload-btn">
              Choose New Image 📸
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-input"
            />
          </div>
        </div>

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