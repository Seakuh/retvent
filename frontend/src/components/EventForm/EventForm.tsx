import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle, X } from 'lucide-react';
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
            <label htmlFor="date">Date</label>
            <div className="calendar-input">
              <input type="datetime-local" id="date" name="date" value={formData.date} onChange={handleChange} required />
              <Calendar size={20} color="white" className="calendar-icon" />
            </div>
          </div>
          <button type="submit" className="submit-button">Create Event</button>
        </form>
      </div>
    </div>
  );
};
