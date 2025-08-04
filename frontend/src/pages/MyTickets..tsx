import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket } from "../utils";
import "./MyTickets.css";
import { getTicket } from "./service";

export const MyTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const savedTickets = JSON.parse(
      localStorage.getItem("savedTickets") || "[]"
    );
    savedTickets.forEach((ticketId: string) => {
      getTicket(ticketId).then((ticket) =>
        setTickets((prev) => [...prev, ticket])
      );
    });
  }, []);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="my-tickets">
      <button className="back-button" onClick={handleBack}>
        <ChevronLeft className="h-5 w-5" />{" "}
      </button>
      <h1>My Tickets</h1>
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <div
            key={ticket.ticketId + ticket.createdAt}
            className="ticket-item"
            onClick={() => navigate(`/ticket/${ticket.ticketId}`)}
          >
            <div className="ticket-header">
              <h2>{ticket.ticketId}</h2>
              <p>{ticket.createdAt.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
