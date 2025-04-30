import { ChevronLeft, Edit, Eye, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminEvents.css";
import { AdminService } from "./admin.service";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  city: string;
  category: string;
  price: string;
  imageUrl?: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const adminService = new AdminService();

  useEffect(() => {
    fetchHostEvents();
  }, []);

  const fetchHostEvents = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("user")!).id;
      const hostEvents = await adminService.getHostEvents(id);
      console.log(hostEvents.events);
      setEvents(hostEvents.events);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm("Are you sure you want to delete this event? 🗑️")) {
      console.log("Delete event", eventId);
      try {
        await adminService.deleteEvent(eventId);
        setEvents(events.filter((event) => event.id !== eventId));
      } catch (error) {
        console.error("Failed to delete event:", error);
      }
    }
  };

  const handleEdit = (eventId: string) => {
    console.log("Edit event", eventId);
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleWatch = (event: Event) => {
    console.log("Watch event", event);
    navigate(`/event/${event.id}`);
    // const eventUrl = `https://event-scanner.com/event/${event.id}`;
    // const messageText = encodeURIComponent(
    //   `🎉 Check out this event: ${event.title}\n` +
    //     `📍 ${event.city}\n` +
    //     `📅 ${event.startDate} at ${event.startTime}\n` +
    //     `💰 ${event.price}\n\n` +
    //     `${eventUrl}`
    // );
    // window.open(`https://wa.me/?text=${messageText}`, "_blank");
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="admin-events-container">
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      {events.length === 0 ? (
        <p className="no-events">No events found.</p>
      ) : (
        <div className="events-grid-my-events">
          {events.map((event) => (
            <div key={event.id} className="event-card-my-events">
              {event.imageUrl && (
                <div className="admin-event-image">
                  <img
                    src={
                      "https://img.event-scanner.com/insecure/q:50/rs:auto/plain/" +
                      event.imageUrl
                    }
                    loading="lazy"
                    alt={event.title}
                    onClick={() => handleEdit(event.id)}
                  />
                </div>
              )}
              <div className="admin-event-content"></div>
              <div className="event-actions-my-events">
                <button
                  onClick={() => handleWatch(event)}
                  className="go-to-event-btn"
                >
                  <Eye size={20} />
                </button>
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
      )}
    </div>
  );
};

export default AdminEvents;
