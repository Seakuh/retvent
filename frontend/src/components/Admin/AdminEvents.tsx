import React, { useEffect, useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminService } from './admin.service';
import './Admin.css';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  city: string;
  category: string;
  price: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const adminService = new AdminService();

  useEffect(() => {
    fetchHostEvents();
  }, []);

  const fetchHostEvents = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("user")!).id;

      const hostEvents = await adminService.getHostEvents(id);
      setEvents(hostEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? 🗑️')) {
      try {
        await adminService.deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleEdit = (eventId: string) => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  return (
    <div className="admin-events-container">
      <h2>My Events 📅</h2>
      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-content">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <div className="event-details">
                <span>📍 {event.city}</span>
                <span>📅 {event.startDate}</span>
                <span>⏰ {event.startTime}</span>
                <span>💰 {event.price}</span>
              </div>
            </div>
            <div className="event-actions">
              <button
                onClick={() => handleEdit(event.id)}
                className="edit-btn"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="delete-btn"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEvents; 