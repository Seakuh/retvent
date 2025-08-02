import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Event, Ticket } from "../utils";
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
    <div>
      <div>
        <img src={event?.imageUrl} alt="eventimage" />
        <p>{ticket?.email}</p>
        <p>{ticket?.status}</p>
        <p>{event?.title}</p>
        <p>{event?.description}</p>
        <p>{event?.startDate?.toLocaleString()}</p>
        <p>{event?.endDate?.toLocaleString()}</p>
        <p>{event?.locationId}</p>
        <p>{event?.price}</p>
        <p>{event?.ticketLink}</p>
      </div>
    </div>
  );
};
