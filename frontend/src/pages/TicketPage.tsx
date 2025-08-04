import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { House } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";
import { Event, FRONTEND_URL, Ticket } from "../utils";
import { getEvent, getTicket } from "./service";
import "./TicketPage.css";

// Custom marker icon for the event location
const eventMarkerIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

  const handleHome = () => {
    navigate("/");
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
                  {event.description && event.description.length > 100
                    ? `${event.description.substring(0, 100)}...`
                    : event.description}
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
        {/* Map view */}
        <div className="map-view">
          <h2>🗺️ Event Location</h2>
          {event.location?.coordinates[0] && event.location?.coordinates[1] ? (
            <div
              className="map-container"
              onClick={() => {
                window.open(
                  `https://www.google.com/maps?q=${event.uploadLat},${event.uploadLon}`,
                  "_blank"
                );
              }}
              title="Click to open in Google Maps"
            >
              <MapContainer
                center={[
                  event.location?.coordinates[0] || 0,
                  event.location?.coordinates[1] || 0,
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker
                  position={[
                    event.location?.coordinates[0] || 0,
                    event.location?.coordinates[1] || 0,
                  ]}
                  icon={eventMarkerIcon}
                >
                  <Popup>
                    <div style={{ textAlign: "center" }}>
                      <strong>{event.title}</strong>
                      <br />
                      <small>
                        📍{" "}
                        {event.address?.street && event.address?.houseNumber
                          ? `${event.address.street} ${
                              event.address.houseNumber
                            }, ${event.address.city || ""}`
                          : event.city || "Location"}
                      </small>
                      <br />
                      <small>Click map to open in Google Maps</small>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          ) : (
            <div className="no-location">
              <p>📍 Location information not available</p>
              <small>Event location coordinates are not set</small>
            </div>
          )}
        </div>
        {/* End map view */}
        <button className="event-button" onClick={handleEventClick}>
          🎫 View Event Details
        </button>
      </div>
      <div className="house-button-container">
        <button onClick={handleHome} className="home-icon">
          <House className="h-5 w-5" />{" "}
        </button>
      </div>
    </div>
  );
};
