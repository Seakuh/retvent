import {
  ChevronLeft,
  ChevronRight,
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
  ExternalLink,
  Phone,
  Plus,
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

interface TicketType {
  name: string;
  price: number;
  currency: string;
  available: number;
  soldOut: boolean;
}

interface PriceDetails {
  amount?: number;
  currency?: string;
  priceRange?: "free" | "low" | "medium" | "high" | "premium";
  ticketTypes?: TicketType[];
}

interface Accessibility {
  wheelchairAccessible?: boolean;
  hearingImpaired?: boolean;
  visualImpaired?: boolean;
}

interface Audience {
  ageRange?: [number, number];
  targetAudience?: string[];
  accessibility?: Accessibility;
}

interface Vibe {
  energy?: number; // 0-100
  intimacy?: number; // 0-100
  exclusivity?: number; // 0-100
  social?: number; // 0-100
}

interface Venue {
  name?: string;
  venueId?: string;
  venueSlug?: string;
  capacity?: number;
  venueType?: "club" | "open-air" | "theater" | "stadium" | "other";
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

// Slider Component for Vibe values
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 100 }) => {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
      />
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
  website?: string;
  email: string;
  phone?: string;
  tags: string[];
  socialMediaLinks: SocialMediaLinks;
  lineup: LineupMember[];
  documents: string[];
  host?: Host;
  views?: number;
  likeIds?: string[];
  priceDetails?: PriceDetails;
  audience?: Audience;
  vibe?: Vibe;
  venue?: Venue;
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
  const [isGeneratingMagicBio, setIsGeneratingMagicBio] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("grundinformationen");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const navContainerRef = React.useRef<HTMLDivElement>(null);
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
    phone: "",
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
    priceDetails: {
      amount: undefined,
      currency: "",
      priceRange: undefined,
      ticketTypes: [],
    },
    audience: {
      ageRange: undefined,
      targetAudience: [],
      accessibility: {
        wheelchairAccessible: false,
        hearingImpaired: false,
        visualImpaired: false,
      },
    },
    vibe: {
      energy: 50,
      intimacy: 50,
      exclusivity: 50,
      social: 50,
    },
    venue: {
      name: "",
      venueId: "",
      venueSlug: "",
      capacity: undefined,
      venueType: undefined,
    },
  });

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "grundinformationen",
        "zeit-ort",
        "preis-tickets",
        "kontakt-links",
        "event-details",
        "lineup",
        "social-media",
        "documents",
        "erweiterte-einstellungen",
        "statistiken-info",
      ];

      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        phone: (event as any).phone || "",
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
        priceDetails: (event as any).priceDetails || {
          amount: undefined,
          currency: "",
          priceRange: undefined,
          ticketTypes: [],
        },
        audience: (event as any).audience || {
          ageRange: undefined,
          targetAudience: [],
          accessibility: {
            wheelchairAccessible: false,
            hearingImpaired: false,
            visualImpaired: false,
          },
        },
        vibe: (event as any).vibe || {
          energy: 50,
          intimacy: 50,
          exclusivity: 50,
          social: 50,
        },
        venue: (event as any).venue || {
          name: "",
          venueId: "",
          venueSlug: "",
          capacity: undefined,
          venueType: undefined,
        },
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

  const handleGenerateMagicBio = async () => {
    if (!eventId) return;
    
    setIsGeneratingMagicBio(true);
    setError(null);
    
    try {
      // Use current description as prompt, or empty string if none
      const currentBio = formData.description || "";
      const magicBio = await eventService.updateEventMagicBio(eventId, currentBio);
      
      // Update the description field with the generated bio
      setFormData((prev) => ({
        ...prev,
        description: magicBio,
      }));
    } catch (err) {
      console.error("Error generating magic bio:", err);
      setError("Failed to generate magic bio. Please try again.");
    } finally {
      setIsGeneratingMagicBio(false);
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

  // Handler for Vibe sliders
  const handleVibeChange = (field: keyof Vibe, value: number) => {
    setFormData((prev) => ({
      ...prev,
      vibe: {
        ...prev.vibe,
        [field]: value,
      },
    }));
  };

  // Handler for Price Details
  const handlePriceDetailsChange = (field: keyof PriceDetails, value: any) => {
    setFormData((prev) => ({
      ...prev,
      priceDetails: {
        ...prev.priceDetails,
        [field]: value,
      },
    }));
  };

  // Handler for Ticket Types
  const addTicketType = () => {
    setFormData((prev) => ({
      ...prev,
      priceDetails: {
        ...prev.priceDetails,
        ticketTypes: [
          ...(prev.priceDetails?.ticketTypes || []),
          { name: "", price: 0, currency: "EUR", available: 0, soldOut: false },
        ],
      },
    }));
  };

  const removeTicketType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      priceDetails: {
        ...prev.priceDetails,
        ticketTypes: prev.priceDetails?.ticketTypes?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: any) => {
    setFormData((prev) => {
      const ticketTypes = [...(prev.priceDetails?.ticketTypes || [])];
      ticketTypes[index] = {
        ...ticketTypes[index],
        [field]: value,
      };
      return {
        ...prev,
        priceDetails: {
          ...prev.priceDetails,
          ticketTypes,
        },
      };
    });
  };

  // Handler for Audience
  const handleAudienceChange = (field: keyof Audience, value: any) => {
    setFormData((prev) => ({
      ...prev,
      audience: {
        ...prev.audience,
        [field]: value,
      },
    }));
  };

  const handleAccessibilityChange = (field: keyof Accessibility, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      audience: {
        ...prev.audience,
        accessibility: {
          ...prev.audience?.accessibility,
          [field]: value,
        },
      },
    }));
  };

  const handleTargetAudienceChange = (value: string) => {
    const audiences = value.split(",").map((a) => a.trim()).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      audience: {
        ...prev.audience,
        targetAudience: audiences,
      },
    }));
  };

  // Handler for Venue
  const handleVenueChange = (field: keyof Venue, value: any) => {
    setFormData((prev) => ({
      ...prev,
      venue: {
        ...prev.venue,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Clone formData to avoid mutating state
      const dataToSubmit = { ...formData };

      // Remove imageUrl to avoid updating it
      if ("imageUrl" in dataToSubmit) {
        delete (dataToSubmit as any).imageUrl;
      }

      if (documents.length > 0) {
        const uploadedDocumentUrls = await Promise.all(
          documents.map((doc) => eventService.uploadDocument(eventId!, doc))
        );
        dataToSubmit.documents = [
          ...(dataToSubmit.documents || []),
          ...uploadedDocumentUrls,
        ];
      }

      await eventService.updateEvent(eventId!, dataToSubmit as Partial<Event>);
      navigate(`/event/${eventId}`);
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Offset für sticky navigation
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const checkScrollButtons = () => {
    if (navContainerRef.current) {
      const container = navContainerRef.current;
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = navContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      navContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    checkScrollButtons();
    if (navContainerRef.current) {
      navContainerRef.current.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        if (navContainerRef.current) {
          navContainerRef.current.removeEventListener("scroll", checkScrollButtons);
        }
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, []);

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

      {/* Animated Hero Section */}
      <div className="edit-event-hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          {imagePreview && (
            <img src={imagePreview} alt="Event" className="hero-image" />
          )}
        </div>
        <div className="hero-content">
          <button onClick={handleBack} className="hero-back-button">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="hero-title-section">
            <h1 className="hero-title">{formData.title || "Untitled Event"}</h1>
            <p className="hero-subtitle">
              {formData.city && <span className="hero-location">{formData.city}</span>}
              {formData.startDate && (
                <span className="hero-date">
                  {typeof formData.startDate === "string" 
                    ? new Date(formData.startDate).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    : new Date(formData.startDate).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="edit-event-nav">
        <button
          className="nav-scroll-btn nav-scroll-left"
          onClick={() => scrollNav("left")}
          style={{ display: showLeftArrow ? "flex" : "none" }}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="nav-container" ref={navContainerRef}>
          <button
            onClick={() => scrollToSection("grundinformationen")}
            className={`nav-item ${activeSection === "grundinformationen" ? "active" : ""}`}
          >
            <Tag size={18} />
            <span>Grundinformationen</span>
          </button>
          <button
            onClick={() => scrollToSection("zeit-ort")}
            className={`nav-item ${activeSection === "zeit-ort" ? "active" : ""}`}
          >
            <Calendar size={18} />
            <span>Zeit & Ort</span>
          </button>
          <button
            onClick={() => scrollToSection("preis-tickets")}
            className={`nav-item ${activeSection === "preis-tickets" ? "active" : ""}`}
          >
            <DollarSign size={18} />
            <span>Preis & Tickets</span>
          </button>
          <button
            onClick={() => scrollToSection("kontakt-links")}
            className={`nav-item ${activeSection === "kontakt-links" ? "active" : ""}`}
          >
            <Mail size={18} />
            <span>Kontakt & Links</span>
          </button>
          <button
            onClick={() => scrollToSection("event-details")}
            className={`nav-item ${activeSection === "event-details" ? "active" : ""}`}
          >
            <Tag size={18} />
            <span>Event-Details</span>
          </button>
          <button
            onClick={() => scrollToSection("lineup")}
            className={`nav-item ${activeSection === "lineup" ? "active" : ""}`}
          >
            <Music size={18} />
            <span>Lineup</span>
          </button>
          <button
            onClick={() => scrollToSection("social-media")}
            className={`nav-item ${activeSection === "social-media" ? "active" : ""}`}
          >
            <Share2 size={18} />
            <span>Social Media</span>
          </button>
          <button
            onClick={() => scrollToSection("documents")}
            className={`nav-item ${activeSection === "documents" ? "active" : ""}`}
          >
            <FileText size={18} />
            <span>Documents</span>
          </button>
          <button
            onClick={() => scrollToSection("erweiterte-einstellungen")}
            className={`nav-item ${activeSection === "erweiterte-einstellungen" ? "active" : ""}`}
          >
            <Sparkles size={18} />
            <span>Erweitert</span>
          </button>
          <button
            onClick={() => scrollToSection("statistiken-info")}
            className={`nav-item ${activeSection === "statistiken-info" ? "active" : ""}`}
          >
            <Eye size={18} />
            <span>Statistiken</span>
          </button>
        </div>
        <button
          className="nav-scroll-btn nav-scroll-right"
          onClick={() => scrollNav("right")}
          style={{ display: showRightArrow ? "flex" : "none" }}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      </nav>

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
          {/* ========== KATEGORIE: GRUNDINFORMATIONEN ========== */}
          <div id="grundinformationen" className="category-section">
            <h2 className="category-title">
              <Tag className="category-icon" />
              Grundinformationen
            </h2>
          </div>

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
              <button
                type="button"
                onClick={handleGenerateMagicBio}
                disabled={isGeneratingMagicBio}
                className="magic-bio-button"
                title="Generate AI-optimized bio"
              >
                <Sparkles size={18} />
                {isGeneratingMagicBio ? "Generating..." : "Magic Bio"}
              </button>
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

          {/* ========== KATEGORIE: ZEIT & ORT ========== */}
          <div id="zeit-ort" className="category-section">
            <h2 className="category-title">
              <Calendar className="category-icon" />
              Zeit & Ort
            </h2>
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

          {/* ========== KATEGORIE: PREIS & TICKETS ========== */}
          <div id="preis-tickets" className="category-section">
            <h2 className="category-title">
              <DollarSign className="category-icon" />
              Preis & Tickets
            </h2>
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

          {/* Venue Card */}
          <div className="admin-card">
            <div className="card-header">
              <MapPin className="card-icon" />
              <span className="card-title">Venue</span>
            </div>
            <div className="form-group">
              <label htmlFor="venue.name">Venue Name</label>
              <input
                type="text"
                id="venue.name"
                value={formData.venue?.name || ""}
                onChange={(e) => handleVenueChange("name", e.target.value)}
                placeholder="Venue name"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="venue.venueId">Venue ID</label>
                <input
                  type="text"
                  id="venue.venueId"
                  value={formData.venue?.venueId || ""}
                  onChange={(e) => handleVenueChange("venueId", e.target.value)}
                  placeholder="Venue ID"
                />
              </div>
              <div className="form-group">
                <label htmlFor="venue.venueSlug">Venue Slug</label>
                <input
                  type="text"
                  id="venue.venueSlug"
                  value={formData.venue?.venueSlug || ""}
                  onChange={(e) => handleVenueChange("venueSlug", e.target.value)}
                  placeholder="venue-slug"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="venue.capacity">Capacity</label>
                <input
                  type="number"
                  id="venue.capacity"
                  value={formData.venue?.capacity || ""}
                  onChange={(e) => handleVenueChange("capacity", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="venue.venueType">Venue Type</label>
                <select
                  id="venue.venueType"
                  value={formData.venue?.venueType || ""}
                  onChange={(e) => handleVenueChange("venueType", e.target.value || undefined)}
                >
                  <option value="">Select venue type</option>
                  <option value="club">Club</option>
                  <option value="open-air">Open Air</option>
                  <option value="theater">Theater</option>
                  <option value="stadium">Stadium</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Price Details Card */}
          <div className="admin-card">
            <div className="card-header">
              <DollarSign className="card-icon" />
              <span className="card-title">Price Details</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priceDetails.amount">Amount</label>
                <input
                  type="number"
                  id="priceDetails.amount"
                  value={formData.priceDetails?.amount || ""}
                  onChange={(e) => handlePriceDetailsChange("amount", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label htmlFor="priceDetails.currency">Currency</label>
                <input
                  type="text"
                  id="priceDetails.currency"
                  value={formData.priceDetails?.currency || ""}
                  onChange={(e) => handlePriceDetailsChange("currency", e.target.value)}
                  placeholder="EUR"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="priceDetails.priceRange">Price Range</label>
              <select
                id="priceDetails.priceRange"
                value={formData.priceDetails?.priceRange || ""}
                onChange={(e) => handlePriceDetailsChange("priceRange", e.target.value || undefined)}
              >
                <option value="">Select price range</option>
                <option value="free">Free</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div className="form-group">
              <div className="form-group-header">
                <label>Ticket Types</label>
                <button
                  type="button"
                  onClick={addTicketType}
                  className="add-btn"
                >
                  <Plus size={16} />
                  Add Ticket Type
                </button>
              </div>
              {formData.priceDetails?.ticketTypes?.map((ticketType, index) => (
                <div key={index} className="ticket-type-item">
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        value={ticketType.name}
                        onChange={(e) => handleTicketTypeChange(index, "name", e.target.value)}
                        placeholder="Ticket name"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        value={ticketType.price}
                        onChange={(e) => handleTicketTypeChange(index, "price", Number(e.target.value))}
                        placeholder="Price"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        value={ticketType.currency}
                        onChange={(e) => handleTicketTypeChange(index, "currency", e.target.value)}
                        placeholder="EUR"
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="number"
                        value={ticketType.available}
                        onChange={(e) => handleTicketTypeChange(index, "available", Number(e.target.value))}
                        placeholder="Available"
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={ticketType.soldOut}
                          onChange={(e) => handleTicketTypeChange(index, "soldOut", e.target.checked)}
                        />
                        Sold Out
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTicketType(index)}
                      className="remove-btn"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========== KATEGORIE: ERWEITERTE EINSTELLUNGEN ========== */}
          <div id="erweiterte-einstellungen" className="category-section">
            <h2 className="category-title">
              <Sparkles className="category-icon" />
              Erweiterte Einstellungen
            </h2>
          </div>

          {/* Vibe Card */}
          <div className="admin-card">
            <div className="card-header">
              <Sparkles className="card-icon" />
              <span className="card-title">Vibe</span>
            </div>
            <div className="vibe-sliders">
              <Slider
                label="Energy"
                value={formData.vibe?.energy || 50}
                onChange={(value) => handleVibeChange("energy", value)}
              />
              <Slider
                label="Intimacy"
                value={formData.vibe?.intimacy || 50}
                onChange={(value) => handleVibeChange("intimacy", value)}
              />
              <Slider
                label="Exclusivity"
                value={formData.vibe?.exclusivity || 50}
                onChange={(value) => handleVibeChange("exclusivity", value)}
              />
              <Slider
                label="Social"
                value={formData.vibe?.social || 50}
                onChange={(value) => handleVibeChange("social", value)}
              />
            </div>
          </div>

          {/* Audience Card */}
          <div className="admin-card">
            <div className="card-header">
              <Users className="card-icon" />
              <span className="card-title">Audience</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="audience.ageRangeMin">Age Range (Min)</label>
                <input
                  type="number"
                  id="audience.ageRangeMin"
                  value={formData.audience?.ageRange?.[0] || ""}
                  onChange={(e) => {
                    const min = e.target.value ? Number(e.target.value) : undefined;
                    const max = formData.audience?.ageRange?.[1];
                    handleAudienceChange("ageRange", min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
                  }}
                  placeholder="18"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label htmlFor="audience.ageRangeMax">Age Range (Max)</label>
                <input
                  type="number"
                  id="audience.ageRangeMax"
                  value={formData.audience?.ageRange?.[1] || ""}
                  onChange={(e) => {
                    const max = e.target.value ? Number(e.target.value) : undefined;
                    const min = formData.audience?.ageRange?.[0];
                    handleAudienceChange("ageRange", min !== undefined || max !== undefined ? [min || 0, max || 100] : undefined);
                  }}
                  placeholder="35"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="audience.targetAudience">Target Audience (comma-separated)</label>
              <input
                type="text"
                id="audience.targetAudience"
                value={formData.audience?.targetAudience?.join(", ") || ""}
                onChange={(e) => handleTargetAudienceChange(e.target.value)}
                placeholder="students, professionals, artists"
              />
            </div>
            <div className="form-group">
              <label>Accessibility</label>
              <div className="accessibility-checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.audience?.accessibility?.wheelchairAccessible || false}
                    onChange={(e) => handleAccessibilityChange("wheelchairAccessible", e.target.checked)}
                  />
                  Wheelchair Accessible
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.audience?.accessibility?.hearingImpaired || false}
                    onChange={(e) => handleAccessibilityChange("hearingImpaired", e.target.checked)}
                  />
                  Hearing Impaired
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.audience?.accessibility?.visualImpaired || false}
                    onChange={(e) => handleAccessibilityChange("visualImpaired", e.target.checked)}
                  />
                  Visual Impaired
                </label>
              </div>
            </div>
          </div>

          {/* ========== KATEGORIE: KONTAKT & LINKS ========== */}
          <div className="category-section">
            <h2 className="category-title">
              <Mail className="category-icon" />
              Kontakt & Links
            </h2>
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
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleInputChange}
                placeholder="+49 123 456789"
              />
            </div>
          </div>

          {/* Website Card */}
          <div className="admin-card">
            <div className="card-header">
              <Link className="card-icon" />
              <span className="card-title">Website</span>
            </div>
            <div className="form-group">
              <label htmlFor="website">Website URL</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* ========== KATEGORIE: STATISTIKEN & INFO ========== */}
          <div id="statistiken-info" className="category-section">
            <h2 className="category-title">
              <Eye className="category-icon" />
              Statistiken & Info
            </h2>
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

          {/* ========== KATEGORIE: EVENT-DETAILS ========== */}
          <div id="event-details" className="category-section">
            <h2 className="category-title">
              <Music className="category-icon" />
              Event-Details
            </h2>
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
          <div id="social-media" className="admin-card full-width">
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
          <div id="lineup" className="admin-card full-width">
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
          <div id="documents" className="admin-card full-width">
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
          {/* <button
            type="button"
            onClick={() => navigate(`/event/${eventId}`)}
            className="view-btn"
            title="View Event"
          >
            <Eye size={18} />
            View
          </button> */}
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
