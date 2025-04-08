import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EventService } from "../../services/event.service";
import { LocationService } from "../../services/location.service";
import { categories } from "../../utils";
import "./CreateEvent.css";

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const eventService = new EventService();
  const locationService = new LocationService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  // const [locations, setLocations] = useState<Location[]>([]);

  const [eventData, setEventData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    description: "",
    price: "",
    ticketUrl: "",
    category: "",
    city: "",
    website: "",
    email: "",
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
    setError("");

    try {
      await eventService.createEvent(eventData, image || undefined);
      navigate("/admin/events");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create event 😢"
      );
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
    navigate(-1);
  };

  return (
    <div className="create-event-container">
      <div className="header-container">
        <button onClick={handleBack} className="back-button">
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
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
              onChange={(e) =>
                setEventData({ ...eventData, title: e.target.value })
              }
              required
            />

            <div className="date-time-group">
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) =>
                  setEventData({ ...eventData, startDate: e.target.value })
                }
              />
              <input
                type="time"
                value={eventData.startTime}
                onChange={(e) =>
                  setEventData({ ...eventData, startTime: e.target.value })
                }
              />
            </div>

            <select
              value={eventData.category}
              onChange={(e) =>
                setEventData({ ...eventData, category: e.target.value })
              }
              className="category-select"
            >
              <option value="">Select Category (optional) 🏷️</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="City (optional)"
              value={eventData.city}
              onChange={(e) =>
                setEventData({ ...eventData, city: e.target.value })
              }
            />

            <textarea
              placeholder="Description (optional)"
              value={eventData.description}
              onChange={(e) =>
                setEventData({ ...eventData, description: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Price (optional)"
              value={eventData.price}
              onChange={(e) =>
                setEventData({ ...eventData, price: e.target.value })
              }
            />

            <input
              type="url"
              placeholder="Ticket URL (optional)"
              value={eventData.ticketUrl}
              onChange={(e) =>
                setEventData({ ...eventData, ticketUrl: e.target.value })
              }
            />

            <input
              type="url"
              placeholder="Website (optional)"
              value={eventData.website}
              onChange={(e) =>
                setEventData({ ...eventData, website: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Contact Email (optional)"
              value={eventData.email}
              onChange={(e) =>
                setEventData({ ...eventData, email: e.target.value })
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="submit-button-create-event"
            >
              {loading ? "Creating... ⏳" : "Create Event 🚀"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
