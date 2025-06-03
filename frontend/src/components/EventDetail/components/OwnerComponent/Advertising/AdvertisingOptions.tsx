import { useState } from "react";
import { useParams } from "react-router-dom";
import "./AdvertisingOptions.css";

interface AdvertisingOption {
  id: string;
  name: string;
  price: number;
  duration: number; // in Tagen
  description: string;
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

  const advertisingOptions: AdvertisingOption[] = [
    {
      id: "basic",
      name: "Basic",
      price: 49.99,
      duration: 3,
      description: "3 days on homepage",
    },
    {
      id: "premium",
      name: "Premium",
      price: 99.99,
      duration: 7,
      description: "7 days on homepage",
    },
    {
      id: "vip",
      name: "VIP",
      price: 199.99,
      duration: 14,
      description: "14 days on homepage",
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

  const selectedOptionData = advertisingOptions.find(
    (opt) => opt.id === selectedOption
  );

  return (
    <div className="advertising-options">
      <h2>Advertise Your Event</h2>
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
          </div>
        ))}
      </div>
      <button
        className="confirm-button"
        onClick={handlePayment}
        disabled={!selectedOption}
      >
        Advertise Now
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
