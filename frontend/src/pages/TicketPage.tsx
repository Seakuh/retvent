import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Event, FRONTEND_URL, Ticket } from "../utils";
import { getEvent, getTicket } from "./service";
import "./TicketPage.css";

export const TicketPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    getTicket(ticketId || "").then((ticket) => {
      console.log("ticket", ticket);
      if (ticket) {
        setTicket(ticket);
        console.log("ticket", ticket);
        getEvent(ticket?.eventId || "").then((event) => {
          setEvent(event);
          console.log(event);
        });
      }
    });
  }, [ticketId]);

  const handleEventClick = () => {
    if (event?.id) {
      navigate(`/event/${event.id}`);
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "TBD";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status: string | undefined) => {
    if (!status) return "";
    return status.toLowerCase() === "valid" ? "valid" : "invalid";
  };

  if (!ticket || !event) {
    return (
      <div className="ticket-page">
        <div className="ticket-container">
          <div className="ticket-header">
            <h1 className="ticket-title">Loading Ticket...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-page">
      <div className="ticket-container">
        <div className="ticket-header">
          {event.imageUrl && (
            <div
              className="ticket-header-content"
              style={{
                position: "relative",
                width: "100%",
                height: "200px",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${event.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(8px) brightness(0.7)",
                  transform: "scale(1.1)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "1.5rem",
                  color: "white",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                <h1
                  className="ticket-title"
                  style={{
                    fontSize: "1.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {event.title}
                </h1>
                <p
                  className="ticket-description"
                  style={{
                    fontSize: "0.9rem",
                    opacity: 0.9,
                  }}
                >
                  {event.description}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="qr-code-ticket-container">
          <QRCodeCanvas
            value={`${FRONTEND_URL}ticket/${ticket.ticketId}`}
            size={200}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
            style={{
              borderRadius: "8px",
            }}
          />
        </div>

        <div className="ticket-info">
          <div className="ticket-info-item">
            <span className="ticket-info-label">Ticket ID</span>
            <span className="ticket-info-value">{ticket.ticketId}</span>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-info-label">Email</span>
            <span className="ticket-info-value">{ticket.email}</span>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-info-label">Status</span>
            <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-info-label">Date</span>
            <span className="ticket-info-value">
              {formatDate(event.startDate)}
            </span>
          </div>

          {event.price && (
            <div className="ticket-info-item">
              <span className="ticket-info-label">Price</span>
              <span className="ticket-info-value">${event.price}</span>
            </div>
          )}
        </div>

        <button className="event-button" onClick={handleEventClick}>
          🎫 View Event Details
        </button>
      </div>
    </div>
  );
};
