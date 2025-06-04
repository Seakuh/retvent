import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ChevronLeft, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdBanner } from "../../../../../Advertisement/AdBanner/AdBanner";
import { API_URL, Event } from "../../../../../utils";
import { AdminService } from "../../../../Admin/admin.service";
import "./AdvertisingOptions.css";

interface AdvertisingOption {
  id: string;
  name: string;
  price: number;
  duration: number; // in Tagen
  description: string;
  features: string[];
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOption: AdvertisingOption | null;
  selectedEvent: Event | null;
  onConfirm: () => void;
}

// Stripe public key (sollte in einer .env Datei gespeichert werden)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  selectedOption: AdvertisingOption;
  selectedEvent: Event;
  onSuccess: () => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const PaymentForm = ({
  selectedOption,
  selectedEvent,
  onSuccess,
  onError,
  onClose,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !selectedEvent) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Erstelle Payment Intent
      const response = await fetch(
        `${API_URL}events/${selectedEvent.id}/create-payment-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // JWT Token
          },
          body: JSON.stringify({
            amount: selectedOption.price,
            currency: "eur",
            packageId: selectedOption.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // 2. Bestätige die Zahlung mit Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              // Hier können weitere Rechnungsdetails hinzugefügt werden
            },
          },
        }
      );

      if (error) {
        setErrorMessage(error.message || "Payment failed");
      } else if (paymentIntent.status === "succeeded") {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="package-summary">
        <h4>Selected Package</h4>
        <div className="package-details">
          <span className="package-name">{selectedOption.name}</span>
          <span className="package-price">{selectedOption.price}€</span>
        </div>
        <div className="package-features">
          {selectedOption.features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="check-icon">✓</span>
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label-headline">Card Information</label>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  backgroundColor: "blue",
                  fontSize: "24px",
                  color: "white",
                  fontFamily: '"Open Sans", sans-serif',
                  "::placeholder": {
                    color: "white",
                  },
                  padding: "12px",
                },
                invalid: {
                  color: "#fa755a",
                  iconColor: "#fa755a",
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="error-message">
          <span className="error-icon">!</span>
          {errorMessage}
        </div>
      )}

      <div className="modal-buttons">
        <button
          type="button"
          className="cancel-button"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="confirm-button"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ${selectedOption.price}€`}
        </button>
      </div>
    </form>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Date not available";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PaymentModal = ({
  isOpen,
  onClose,
  selectedOption,
  selectedEvent,
  onConfirm,
}: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Complete Your Purchase</h2>
          <button className="close-button" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {selectedOption && selectedEvent && (
          <div className="checkout-details">
            <div className="selected-event">
              <div className="event-thumbnail">
                <img
                  src={selectedEvent.imageUrl || "/default-event-image.jpg"}
                  alt={selectedEvent.title}
                />
              </div>
              <div className="event-info">
                <h4>{selectedEvent.title}</h4>
                <p className="event-date">
                  {formatDate(selectedEvent.startDate)}
                </p>
              </div>
            </div>

            <div className="package-info">
              <h3>{selectedOption.name}</h3>
              <div className="package-highlights">
                <div className="highlight-item">
                  <span className="highlight-label">Duration</span>
                  <span className="highlight-value">
                    {selectedOption.duration} days
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-label">Price</span>
                  <span className="highlight-value price-tag">
                    {selectedOption.price}€
                  </span>
                </div>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <PaymentForm
                selectedOption={selectedOption}
                selectedEvent={selectedEvent}
                onSuccess={() => {
                  onConfirm();
                  onClose();
                }}
                onError={(error) => {
                  console.error(error);
                }}
                onClose={onClose}
              />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdvertisingOptions = () => {
  const { eventId } = useParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const adminService = new AdminService();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

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
  const advertisingOptions: AdvertisingOption[] = [
    {
      id: "basic",
      name: "Basic Highlight",
      price: 49.99,
      duration: 3,
      description: "3 days premium visibility with guaranteed clicks",
      features: [
        "Premium placement in homepage banner",
        "Guaranteed 500+ clicks",
        "Enhanced visibility for 3 days",
        "Basic analytics dashboard",
        "Standard support",
      ],
    },
    {
      id: "premium",
      name: "Spotlight",
      price: 99.99,
      duration: 7,
      description: "7 days maximum visibility with premium click guarantee",
      features: [
        "Top placement in homepage banner",
        "Guaranteed 1,500+ clicks",
        "3x higher visibility for 7 days",
        "Advanced analytics dashboard",
        "Priority support",
        "Social media promotion",
      ],
    },
    {
      id: "showcase",
      name: "Showcase",
      price: 199.99,
      duration: 14,
      description: "14 days exclusive visibility with VIP click guarantee",
      features: [
        "Exclusive banner placement",
        "Guaranteed 3,500+ clicks",
        "5x higher visibility for 14 days",
        "Premium analytics dashboard",
        "24/7 priority support",
        "Social media campaign",
        "Email newsletter feature",
        "Custom promotion strategy",
      ],
    },
  ];

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    try {
      // Hier API-Call implementieren
      // await api.purchaseAdvertising(selectedOption);
      setShowPaymentModal(false);
      // Erfolgsmeldung anzeigen
    } catch (error) {
      // Fehlerbehandlung
      console.error("Payment failed:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const selectedOptionData = advertisingOptions.find(
    (opt) => opt.id === selectedOption
  );

  return (
    <div className="advertising-options">
      <AdBanner />
      <button className="back-button" onClick={handleBack}>
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="advertising-header">
        <h2>Boost Your Event Visibility</h2>
        <p className="subtitle">
          Get your event featured on our homepage and reach thousands of
          potential attendees
        </p>
      </div>

      <div className="advertising-event-selection">
        <h3>Select Your Event</h3>
        <div className="advertising-event-list">
          {events.map((event) => (
            <div
              key={event.id}
              className={`advertising-event-card ${
                selectedEvent === event.id ? "selected" : ""
              }`}
              onClick={() => setSelectedEvent(event.id)}
            >
              <div className="advertising-event-thumbnail">
                <img
                  src={`https://img.event-scanner.com/insecure/rs:fill:320:350/q:70/plain/${event.imageUrl}@webp`}
                  alt={event.title}
                  className="advertising-event-image"
                />
              </div>
              <div className="advertising-event-details">
                <h4>{event.title}</h4>
                <p className="advertising-event-date">
                  {formatDate(event.startDate)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <h3>Select Your Advertising Package</h3>
      </div>

      <div className="advertising-options-container">
        {advertisingOptions.map((option) => (
          <div
            key={option.id}
            className={`advertising-option-card ${
              selectedOption === option.id ? "selected" : ""
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <h3>{option.name}</h3>
            <p className="advertising-price">{option.price}€</p>
            <p className="advertising-duration">{option.duration} days</p>
            <p className="advertising-description">{option.description}</p>
            <ul className="features-list">
              {option.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="legal-section">
        <h4>Terms & Conditions</h4>
        <ul>
          <li>
            All advertising campaigns are subject to our content guidelines
          </li>
          <li>
            We reserve the right to reject or modify content that violates our
            policies
          </li>
          <li>
            Campaign start date will be confirmed within 24 hours of purchase
          </li>
          <li>
            Refunds are available within 24 hours if the campaign hasn't started
          </li>
        </ul>
      </div>

      <button
        className="confirm-button"
        onClick={handlePayment}
        disabled={!selectedOption}
      >
        Start Campaign
      </button>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedOption={selectedOptionData || null}
        selectedEvent={
          events.find((event) => event.id === selectedEvent) || null
        }
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
};
