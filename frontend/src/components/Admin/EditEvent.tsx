import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EventService } from "../../services/event.service";
import { API_URL, categories, Event } from "../../utils";
import "./EditEvent.css";

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const eventService = new EventService();

  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    city: "",
    category: "",
    price: "",
    imageUrl: "",
    ticketLink: "",
    website: "",
    email: "",
    tags: [],
    socialMediaLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
    },
    lineup: [],
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const event = await eventService.getEventById(eventId!);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        startDate: event.startDate || "",
        startTime: event.startTime || "",
        endDate: event.endDate || "",
        endTime: event.endTime || "",
        city: event.city || "",
        category: event.category || "",
        price: event.price || "",
        imageUrl: event.imageUrl || "",
        ticketLink: event.ticketLink || "",
        website: event.website || "",
        email: event.email || "",
        tags: event.tags || [],
        socialMediaLinks: {
          instagram: event.socialMediaLinks?.instagram || "",
          facebook: event.socialMediaLinks?.facebook || "",
          twitter: event.socialMediaLinks?.twitter || "",
        },
        lineup: event.lineup || [],
      });
      if (event.imageUrl) {
        setImagePreview(event.imageUrl);
      }
    } catch (err) {
      setError("Failed to fetch event details 😢");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialNetwork = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMediaLinks: {
          ...prev.socialMediaLinks,
          [socialNetwork]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    console.log("handleImageChange");
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      console.log(file);
      eventService.updateEventImage(eventId!, file);
    }
    setLoading(false);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((tag) => tag.trim());
    setFormData((prev) => ({
      ...prev,
      tags,
    }));
  };

  const handleLineupChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const newLineup = [...(prev.lineup || [])];
      newLineup[index] = {
        ...newLineup[index],
        [field]: value,
      };
      return {
        ...prev,
        lineup: newLineup,
      };
    });
  };

  const addLineupMember = () => {
    setFormData((prev) => ({
      ...prev,
      lineup: [...(prev.lineup || []), { name: "", role: "", startTime: "" }],
    }));
  };

  const removeLineupMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineup: prev.lineup?.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await eventService.updateEvent(eventId!, formData);
      navigate("/admin/events");
    } catch (err) {
      setError("Failed to update event 😢");
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(-1);
  };

  if (loading)
    return (
      <div className="loading-spinner-edit-event-container">
        <div className="loading-spinner"></div>
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  async function handlePromptUpdate(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): Promise<void> {
    setLoading(true);
    const prompt = document.getElementById(
      "edit-event-prompt"
    ) as HTMLTextAreaElement;
    const promptText = prompt.value;
    console.log(promptText);
    await eventService.updateEventPrompt(eventId!, promptText);
    navigate(API_URL + "/event/" + eventId);
    setLoading(false);
  }

  return (
    <div className="edit-event-container">
      {loading && (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
        </div>
      )}
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <h2>Edit Event ✏️</h2>
      <form onSubmit={handleSubmit} className="edit-event-form">
        <div className="image-upload-section">
          <div className="current-image">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Event preview"
                className="image-preview"
              />
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description 📄</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="prompt-update">
          <p className="prompt-update-text">
            <textarea
              className="edit-event-prompt"
              name="edit-event-prompt"
              id="edit-event-prompt"
              placeholder="Magic update your event put in everything"
            />
          </p>
          <button
            type="button"
            className="save-prompt-btn"
            onClick={handlePromptUpdate}
          >
            Magic Update
          </button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date 📅</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time ⏰</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="endDate">End Date 📅</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time ⏰</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
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
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.name} value={category.name}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">City 🏙️</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="ticketLink">Ticket Link 🎟️</label>
          <input
            id="ticketLink"
            name="ticketLink"
            value={formData.ticketLink}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="website">Website 🌐</label>
          <input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Contact Email 📧</label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags 🏷️ (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags?.join(", ")}
            onChange={handleTagsChange}
            placeholder="music, party, live"
          />
        </div>

        <div className="social-media-section">
          <h3>Social Media Links 📱</h3>
          <div className="form-group">
            <label htmlFor="social.instagram">Instagram</label>
            <input
              type="url"
              id="social.instagram"
              name="social.instagram"
              value={formData.socialMediaLinks?.instagram}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="social.facebook">Facebook</label>
            <input
              type="url"
              id="social.facebook"
              name="social.facebook"
              value={formData.socialMediaLinks?.facebook}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="social.twitter">Twitter</label>
            <input
              type="url"
              id="social.twitter"
              name="social.twitter"
              value={formData.socialMediaLinks?.twitter}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="lineup-section">
          <h3>Lineup 🎭</h3>
          <button
            type="button"
            onClick={addLineupMember}
            className="add-lineup-btn"
          >
            Add Performer +
          </button>
          {formData.lineup?.map((member, index) => (
            <div key={index} className="lineup-member">
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleLineupChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) =>
                      handleLineupChange(index, "role", e.target.value)
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={member.startTime}
                    onChange={(e) =>
                      handleLineupChange(index, "startTime", e.target.value)
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLineupMember(index)}
                  className="remove-lineup-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="cancel-btn"
          >
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
