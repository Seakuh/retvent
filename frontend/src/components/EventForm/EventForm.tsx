import React, { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import './EventForm.css';

interface EventFormProps {
  onSubmit: (event: any) => Promise<void>;
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    category: '',
    price: '',
    imageUrl: '',
    latitude: '',
    longitude: ''
  });
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        imageUrl: image ? URL.createObjectURL(image) : formData.imageUrl
      };
      await onSubmit(eventData);
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="event-form-overlay">
      <div className="event-form-container">
        <button onClick={onClose} className="close-button">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
        <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
            <label htmlFor="image">Image Upload</label>
            <div 
              className="image-upload" 
              onDrop={handleDrop} 
              onDragOver={(e) => e.preventDefault()}
            >
              {image ? (
                <img src={URL.createObjectURL(image)} alt="Uploaded preview" className="image-preview" />
              ) : (
                <p>Drag & drop an image or click to upload</p>
              )}
              <input type="file" id="image" name="image" onChange={handleFileChange} accept="image/*" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

    

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 52.520008"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. 13.404954"
              />
            </div>
          </div>

          <button type="submit" className="submit-button">
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
};
