import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, FRONTEND_URL, Ticket } from "../utils";
import { getEvent, getTicket } from "./service";
import "./TicketPage.css";

export const TicketPage = () => {
  const { ticketId } = useParams();
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
  return (
    <div className="ticket-page">
      <div>
        <div className="qr-code-ticket-container">
          <QRCodeCanvas
            value={`${FRONTEND_URL}ticket/${ticket?.ticketId}`}
            size={420}
            level="H"
            bgColor="#FFFFFF"
            fgColor="#000000"
            includeMargin={true}
            style={{
              borderRadius: "10px",
              padding: "0.5rem",
              backgroundColor: "black",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          />
        </div>{" "}
        <img className="ticket-image" src={event?.imageUrl} alt="eventimage" />
        <p className="ticket-email">{ticket?.email}</p>
        <p className="ticket-status">{ticket?.status}</p>
        <p className="ticket-title">{event?.title}</p>
        <p className="ticket-description">{event?.description}</p>
        <p className="ticket-startDate">{event?.startDate?.toLocaleString()}</p>
        <p className="ticket-endDate">{event?.endDate?.toLocaleString()}</p>
        <p className="ticket-locationId">{event?.locationId}</p>
        <p className="ticket-price">{event?.price}</p>
        <p className="ticket-ticketLink">{event?.ticketLink}</p>
      </div>
    </div>
  );
};
