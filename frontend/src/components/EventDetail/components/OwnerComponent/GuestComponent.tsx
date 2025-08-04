import { AlertCircle, CheckCircle, Mail, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Ticket } from "../../../../utils";
import "./GuestComponent.css";
import { createTicket, deleteTicket, getTicketsForEvent } from "./service";

interface GuestComponentProps {
  eventId: string;
}

const GuestComponent: React.FC<GuestComponentProps> = ({ eventId }) => {
  const [guests, setGuests] = useState<Ticket[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);

  useEffect(() => {
    fetchGuests();
  }, [eventId]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const data = await getTicketsForEvent(eventId);
      setGuests(data);
    } catch {
      setError("Failed to load guests 😢");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (email: string) => {
    setNewEmail(email);
    setIsValidEmail(email === "" || validateEmail(email));
  };

  const addGuest = async () => {
    if (!newEmail.trim()) {
      setError("Please enter an email address 📧");
      return;
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address 📧");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const newGuest = await createTicket(eventId, newEmail.trim());
      setGuests((prev) => [...prev, newGuest]);
      setNewEmail("");
      setSuccess("Guest added successfully! 🎉");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to add guest 😢");
    } finally {
      setLoading(false);
    }
  };

  const removeGuest = async (guestTicketId: string) => {
    try {
      setLoading(true);
      await deleteTicket(guestTicketId);
      setGuests((prev) =>
        prev.filter((guest) => guest.ticketId !== guestTicketId)
      );
      setSuccess("Guest removed successfully! 🗑️");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to remove guest 😢");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      addGuest();
    }
  };

  return (
    <div className="guest-component">
      <div className="guest-header">
        <div className="guest-header-content">
          <h2 className="section-title">Guest List </h2>
          <span className="guest-count">{guests.length} guests</span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="message success-message">
          <CheckCircle className="message-icon" />
          {success}
        </div>
      )}

      {error && (
        <div className="message error-message">
          <AlertCircle className="message-icon" />
          {error}
        </div>
      )}

      {/* Add Guest Form */}
      <div className="add-guest-form">
        <div className="email-input-container">
          <Mail className="email-icon" />
          <input
            type="email"
            placeholder="Enter guest email address..."
            value={newEmail}
            onChange={(e) => handleEmailChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`email-input ${
              !isValidEmail && newEmail ? "invalid" : ""
            }`}
            disabled={loading}
          />
          <button
            onClick={addGuest}
            disabled={loading || !newEmail.trim() || !isValidEmail}
            className="add-guest-btn"
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <Plus className="plus-icon" />
            )}
          </button>
        </div>
        {!isValidEmail && newEmail && (
          <span className="validation-error">
            Please enter a valid email address 📧
          </span>
        )}
      </div>

      {/* Guests List */}
      <div className="guests-list">
        {loading && guests.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading guests... ⏳</p>
          </div>
        ) : guests.length === 0 ? (
          <div className="empty-state">
            <Mail className="empty-icon" />
            <p>No guests added yet</p>
            <span>Add guest emails to manage your event attendees</span>
          </div>
        ) : (
          guests.map((guest) => (
            <div key={guest.email} className="guest-item">
              <div className="guest-info">
                <Mail className="guest-email-icon" />
                <span className="guest-email">{guest.email}</span>
                {guest.createdAt && (
                  <span className="guest-date">
                    Added {new Date(guest.createdAt).toLocaleDateString()}
                  </span>
                )}{" "}
              </div>
              <button
                onClick={() => removeGuest(guest.ticketId)}
                disabled={loading}
                className="remove-guest-btn"
                title="Remove guest"
              >
                <Trash2 className="trash-icon" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestComponent;
