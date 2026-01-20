import {
  ChevronLeft,
  FileText,
  X,
  Upload,
  Trash2,
  Sparkles,
  Image,
  Calendar,
  MapPin,
  Tag,
  DollarSign,
  Link,
  Mail,
  Users,
  Share2,
  Music,
  Eye,
  Heart,
  Crop,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cropper, { Area } from "react-easy-crop";
import { EventService } from "../../services/event.service";
import { categories, Event } from "../../utils";
import "./EditEvent.css";

interface Address {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
}

interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

interface Host {
  profileImageUrl?: string;
  username?: string;
}

interface LineupMember {
  name: string;
  role?: string;
  startTime?: string;
  endTime?: string;
}

// Time Picker Component
interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(value ? value.split(":")[0] : "00");
  const [minutes, setMinutes] = useState(value ? value.split(":")[1] : "00");

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );

  const handleConfirm = () => {
    onChange(`${hours}:${minutes}`);
    setIsOpen(false);
  };

  const displayValue = value || "--:--";

  return (
    <div className="time-picker-wrapper">
      {label && <label className="time-picker-label">{label}</label>}
      <button
        type="button"
        className="time-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="time-picker-value">{displayValue}</span>
        <span className="time-picker-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="time-picker-dropdown">
          <div className="time-picker-columns">
            <div className="time-picker-column">
              <span className="time-picker-column-label">Hour</span>
              <div className="time-picker-scroll">
                {hourOptions.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`time-picker-option ${hours === h ? "active" : ""}`}
                    onClick={() => setHours(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="time-picker-separator">:</div>
            <div className="time-picker-column">
              <span className="time-picker-column-label">Min</span>
              <div className="time-picker-scroll">
                {minuteOptions.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`time-picker-option ${minutes === m ? "active" : ""}`}
                    onClick={() => setMinutes(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="time-picker-actions">
            <button
              type="button"
              className="time-picker-cancel"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="time-picker-confirm"
              onClick={handleConfirm}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface EventFormData {
  title: string;
  description: string;
  imageUrl: string;
  startDate: string | Date;
  startTime: string;
  endDate: string | Date;
  endTime: string;
  city: string;
  address: Address;
  category: string;
  price: string;
  ticketLink: string;
  website: string;
  email: string;
  tags: string[];
  socialMediaLinks: SocialMediaLinks;
  lineup: LineupMember[];
  documents: string[];
  host?: Host;
  views?: number;
  likeIds?: string[];
}

const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [promptText, setPromptText] = useState("");
  const eventService = new EventService();

  // Image Cropper States
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    imageUrl: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    city: "",
    address: {
      street: "",
      houseNumber: "",
      postalCode: "",
      city: "",
    },
    category: "",
    price: "",
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
    documents: [],
    host: undefined,
    views: 0,
    likeIds: [],
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const formatDateForInput = (dateValue: string | Date | undefined): string => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const fetchEventDetails = async () => {
    try {
      const event = await eventService.getEventById(eventId!);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        imageUrl: event.imageUrl || "",
        startDate: formatDateForInput(event.startDate),
        startTime: event.startTime || "",
        endDate: formatDateForInput(event.endDate),
        endTime: event.endTime || "",
        city: event.city || "",
        address: {
          street: event.address?.street || "",
          houseNumber: event.address?.houseNumber || "",
          postalCode: event.address?.postalCode || "",
          city: event.address?.city || event.city || "",
        },
        category: event.category || "",
        price: event.price || "",
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
        documents: event.documents || [],
        host: event.host,
        views: event.views || 0,
        likeIds: event.likeIds || [],
      });
      if (event.imageUrl) {
        setImagePreview(event.imageUrl);
      }
      if (event.documents) {
        setDocumentUrls(event.documents);
      }
    } catch (err) {
      setError("Failed to fetch event details");
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
    } else if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<Blob> => {
    const image = new window.Image();
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Canvas is empty"));
          }
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleCropApply = async () => {
    if (!tempImage || !croppedAreaPixels) return;

    setLoading(true);
    try {
      const croppedBlob = await createCroppedImage(tempImage, croppedAreaPixels);
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setImagePreview(croppedUrl);

      const file = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });
      await eventService.updateEventImage(eventId!, file);

      setShowCropper(false);
      setTempImage(null);
    } catch (err) {
      console.error("Error cropping image:", err);
      setError("Failed to crop image");
    } finally {
      setLoading(false);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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
      lineup: [...(prev.lineup || []), { name: "", role: "", startTime: "", endTime: "" }],
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
      if (documents.length > 0) {
        const uploadedDocumentUrls = await Promise.all(
          documents.map((doc) => eventService.uploadDocument(eventId!, doc))
        );
        formData.documents = [
          ...(formData.documents || []),
          ...uploadedDocumentUrls,
        ];
      }

      await eventService.updateEvent(eventId!, formData as Partial<Event>);
      navigate("/admin/events");
    } catch (err) {
      setError("Failed to update event");
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("application/") || file.type === "application/pdf"
    );

    if (validFiles.length > 0) {
      setDocuments((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("application/") || file.type === "application/pdf"
    );
    if (validFiles.length > 0) {
      setDocuments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDocumentUrl = async (index: number) => {
    const urlToRemove = documentUrls[index];
    try {
      await eventService.deleteDocument(eventId!, urlToRemove);
      setDocumentUrls((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        documents: prev.documents?.filter(
          (_: string, i: number) => i !== index
        ),
      }));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate(-1);
  };

  const handlePromptUpdate = async (): Promise<void> => {
    if (!promptText.trim()) return;
    setLoading(true);
    try {
      await eventService.updateEventPrompt(eventId!, promptText);
      navigate(`/event/${eventId}`);
    } catch (err) {
      setError("Failed to update event with AI");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading-spinner-edit-event-container">
        <div className="loading-spinner"></div>
      </div>
    );
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-event-container">
      {loading && (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal-header">
            <span className="cropper-modal-title">Crop Image</span>
            <button
              type="button"
              className="cropper-close-btn"
              onClick={handleCropCancel}
            >
              <X size={20} />
            </button>
          </div>
          <div className="cropper-container">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="cropper-controls">
            <div className="aspect-ratio-controls">
              <span className="aspect-ratio-label">Aspect Ratio</span>
              <button
                type="button"
                className={`aspect-ratio-btn ${aspectRatio === 16 / 9 ? "active" : ""}`}
                onClick={() => setAspectRatio(16 / 9)}
              >
                16:9
              </button>
              <button
                type="button"
                className={`aspect-ratio-btn ${aspectRatio === 4 / 3 ? "active" : ""}`}
                onClick={() => setAspectRatio(4 / 3)}
              >
                4:3
              </button>
              <button
                type="button"
                className={`aspect-ratio-btn ${aspectRatio === 1 ? "active" : ""}`}
                onClick={() => setAspectRatio(1)}
              >
                1:1
              </button>
              <button
                type="button"
                className={`aspect-ratio-btn ${aspectRatio === 9 / 16 ? "active" : ""}`}
                onClick={() => setAspectRatio(9 / 16)}
              >
                9:16
              </button>
            </div>
            <div className="zoom-control">
              <span className="zoom-label">Zoom</span>
              <input
                type="range"
                className="zoom-slider"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
            <div className="cropper-actions">
              <button
                type="button"
                className="cropper-cancel-btn"
                onClick={handleCropCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cropper-apply-btn"
                onClick={handleCropApply}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="edit-event-header">
        <button onClick={handleBack} className="back-button">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2>Edit Event: {formData.title || "Untitled"}</h2>
      </div>

      {/* Magic Update Section - Prominent at Top */}
      <div className="magic-update-section">
        <div className="magic-update-header">
          <Sparkles className="card-icon" />
          <span className="magic-update-title">Magic Update</span>
        </div>
        <p className="magic-update-subtitle">
          Describe your changes in natural language and let AI update your event
        </p>
        <textarea
          className="magic-update-textarea"
          placeholder="e.g., Change the start time to 8pm, update the description to mention live music..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <button
          type="button"
          className="magic-update-btn"
          onClick={handlePromptUpdate}
          disabled={!promptText.trim()}
        >
          Update with AI
        </button>
      </div>

      <form onSubmit={handleSubmit} className="edit-event-form">
        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Event Image Card */}
          <div className="admin-card">
            <div className="card-header">
              <Image className="card-icon" />
              <span className="card-title">Event Image</span>
            </div>
            <div className="image-upload-card">
              <div className="image-preview-container">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="no-image">No image selected</div>
                )}
              </div>
              <label htmlFor="image" className="image-upload-btn">
                Choose Image
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

          {/* Basic Info Card */}
          <div className="admin-card">
            <div className="card-header">
              <Tag className="card-icon" />
              <span className="card-title">Basic Information</span>
            </div>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Event title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Card - Full Width */}
          <div className="admin-card full-width">
            <div className="card-header">
              <FileText className="card-icon" />
              <span className="card-title">Description</span>
            </div>
            <div className="form-group">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
              />
            </div>
          </div>

          {/* Date & Time Card */}
          <div className="admin-card">
            <div className="card-header">
              <Calendar className="card-icon" />
              <span className="card-title">Date & Time</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={
                    typeof formData.startDate === "string"
                      ? formData.startDate
                      : ""
                  }
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
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
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={
                    typeof formData.endDate === "string" ? formData.endDate : ""
                  }
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="admin-card">
            <div className="card-header">
              <MapPin className="card-icon" />
              <span className="card-title">Location</span>
            </div>
            <div className="address-grid">
              <div className="form-group">
                <label htmlFor="address.street">Street</label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={formData.address?.street || ""}
                  onChange={handleInputChange}
                  placeholder="Street name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.houseNumber">Nr.</label>
                <input
                  type="text"
                  id="address.houseNumber"
                  name="address.houseNumber"
                  value={formData.address?.houseNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Nr."
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address.postalCode">Postal Code</label>
                <input
                  type="text"
                  id="address.postalCode"
                  name="address.postalCode"
                  value={formData.address?.postalCode || ""}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                />
              </div>
              <div className="form-group">
                <label htmlFor="address.city">City</label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address?.city || ""}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Tickets Card */}
          <div className="admin-card">
            <div className="card-header">
              <DollarSign className="card-icon" />
              <span className="card-title">Pricing & Tickets</span>
            </div>
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., Free, 10EUR, N/A"
              />
            </div>
            <div className="form-group">
              <label htmlFor="ticketLink">Ticket Link</label>
              <input
                type="url"
                id="ticketLink"
                name="ticketLink"
                value={formData.ticketLink}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Contact Card */}
          <div className="admin-card">
            <div className="card-header">
              <Mail className="card-icon" />
              <span className="card-title">Contact</span>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@event.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Host Info Card */}
          {formData.host && (
            <div className="admin-card">
              <div className="card-header">
                <Users className="card-icon" />
                <span className="card-title">Host</span>
              </div>
              <div className="host-info-display">
                {formData.host.profileImageUrl && (
                  <img
                    src={formData.host.profileImageUrl}
                    alt={formData.host.username}
                    className="host-avatar"
                  />
                )}
                <span className="host-username">{formData.host.username}</span>
              </div>
            </div>
          )}

          {/* Stats Card */}
          <div className="admin-card">
            <div className="card-header">
              <Eye className="card-icon" />
              <span className="card-title">Statistics</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{formData.views || 0}</span>
                <span className="stat-label">Views</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {formData.likeIds?.length || 0}
                </span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formData.tags?.length || 0}</span>
                <span className="stat-label">Tags</span>
              </div>
            </div>
          </div>

          {/* Tags Card - Full Width */}
          <div className="admin-card full-width">
            <div className="card-header">
              <Tag className="card-icon" />
              <span className="card-title">Tags</span>
            </div>
            <div className="form-group">
              <label htmlFor="tags">Tags (comma-separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags?.join(", ")}
                onChange={handleTagsChange}
                placeholder="music, party, live, outdoor"
              />
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="tags-display">
                {formData.tags.map(
                  (tag, index) =>
                    tag && (
                      <span key={index} className="tag-item">
                        {tag}
                      </span>
                    )
                )}
              </div>
            )}
          </div>

          {/* Social Media Card - Full Width */}
          <div className="admin-card full-width">
            <div className="card-header">
              <Share2 className="card-icon" />
              <span className="card-title">Social Media</span>
            </div>
            <div className="social-media-grid">
              <div className="form-group">
                <label htmlFor="social.instagram">Instagram</label>
                <input
                  type="url"
                  id="social.instagram"
                  name="social.instagram"
                  value={formData.socialMediaLinks?.instagram || ""}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="social.facebook">Facebook</label>
                <input
                  type="url"
                  id="social.facebook"
                  name="social.facebook"
                  value={formData.socialMediaLinks?.facebook || ""}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="social.twitter">Twitter</label>
                <input
                  type="url"
                  id="social.twitter"
                  name="social.twitter"
                  value={formData.socialMediaLinks?.twitter || ""}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </div>

          {/* Lineup Card - Full Width */}
          <div className="admin-card full-width">
            <div className="card-header">
              <Music className="card-icon" />
              <span className="card-title">Lineup</span>
            </div>
            <div className="lineup-list">
              {formData.lineup?.map((member, index) => (
                <div key={index} className="lineup-member">
                  <div className="lineup-member-grid">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) =>
                          handleLineupChange(index, "name", e.target.value)
                        }
                        placeholder="Artist name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <input
                        type="text"
                        value={member.role || ""}
                        onChange={(e) =>
                          handleLineupChange(index, "role", e.target.value)
                        }
                        placeholder="DJ, Band, etc."
                      />
                    </div>
                    <TimePicker
                      label="Start"
                      value={member.startTime || ""}
                      onChange={(value) =>
                        handleLineupChange(index, "startTime", value)
                      }
                    />
                    <TimePicker
                      label="End"
                      value={member.endTime || ""}
                      onChange={(value) =>
                        handleLineupChange(index, "endTime", value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeLineupMember(index)}
                      className="remove-lineup-btn"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addLineupMember}
              className="add-lineup-btn"
            >
              Add Performer
            </button>
          </div>

          {/* Documents Card - Full Width */}
          <div className="admin-card full-width">
            <div className="card-header">
              <FileText className="card-icon" />
              <span className="card-title">Documents</span>
            </div>
            <div
              className={`document-drop-zone ${isDragging ? "dragging" : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="upload-icon" />
              <p className="drop-zone-text">
                {isDragging
                  ? "Drop files here"
                  : "Drop files here or click to select"}
              </p>
              <input
                type="file"
                id="documents"
                multiple
                accept="application/pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden-input"
              />
              <label htmlFor="documents" className="document-upload-btn">
                Select Files
              </label>
            </div>

            {documentUrls.length > 0 && (
              <div className="document-list">
                <h4>Existing Documents</h4>
                {documentUrls.map((url, index) => (
                  <div key={`url-${index}`} className="document-item">
                    <FileText className="document-icon" />
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      {url.split("/").pop() || `Document ${index + 1}`}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocumentUrl(index)}
                      className="remove-document-btn"
                      title="Delete document"
                    >
                      <Trash2 className="trash-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {documents.length > 0 && (
              <div className="document-list">
                <h4>New Documents</h4>
                {documents.map((doc, index) => (
                  <div key={`file-${index}`} className="document-item">
                    <FileText className="document-icon" />
                    <span className="document-name">{doc.name}</span>
                    <span className="document-size">
                      ({(doc.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="remove-document-btn"
                      title="Remove document"
                    >
                      <X className="remove-icon" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
