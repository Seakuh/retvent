import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdBanner } from "../../../../../Advertisement/AdBanner/AdBanner";
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
  onConfirm: () => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  selectedOption,
  onConfirm,
}: PaymentModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Checkout</h2>
        {selectedOption && (
          <div className="checkout-details">
            <h3>{selectedOption.name} Package</h3>
            <p>Duration: {selectedOption.duration} days</p>
            <p>Price: {selectedOption.price}€</p>
            <div className="legal-notice">
              <p>
                By proceeding with payment, you agree to our Terms of Service
                and Advertising Guidelines.
              </p>
              <p>
                All prices include VAT. Refunds are available within 24 hours of
                purchase if the campaign hasn't started.
              </p>
            </div>
          </div>
        )}
        <div className="payment-form">
          <input type="text" placeholder="Card Number" />
          <div className="card-details">
            <input type="text" placeholder="MM/YY" />
            <input type="text" placeholder="CVC" />
          </div>
          <input type="text" placeholder="Name on Card" />
        </div>
        <div className="modal-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdvertisingOptions = () => {
  const { eventId } = useParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigate = useNavigate();

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
      name: "Premium Spotlight",
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
      id: "vip",
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

      <div className="options-container">
        {advertisingOptions.map((option) => (
          <div
            key={option.id}
            className={`option-card ${
              selectedOption === option.id ? "selected" : ""
            }`}
            onClick={() => setSelectedOption(option.id)}
          >
            <h3>{option.name}</h3>
            <p className="price">{option.price}€</p>
            <p className="duration">{option.duration} days</p>
            <p className="description">{option.description}</p>
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
        onConfirm={handlePaymentConfirm}
      />
    </div>
  );
};
