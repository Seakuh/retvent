import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyTickets.css";
import { getTickets } from "./service";

export const MyTickets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    const savedTickets = JSON.parse(
      localStorage.getItem("savedTickets") || "[]"
    );
    getTickets(savedTickets).then((tickets) => {
      setTickets(tickets);
      console.log(tickets);
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
