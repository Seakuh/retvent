import { useTicket } from "../../../../hooks/useTicket";
import { TicketDefinition } from "../../../../utils";
import "./Tickets.css";

export const Tickets = (eventId: string | undefined) => {
  const { ticketDefinitions } = useTicket(eventId);
  console.log(ticketDefinitions);
  const isAvailable = (ticketDefinition: TicketDefinition) => {
    const now = new Date();
    return (
      now >= new Date(ticketDefinition.availableFrom || "") &&
      now <= new Date(ticketDefinition.availableUntil || "")
    );
  };

  return (
    <>
      {ticketDefinitions.map((ticketDefinition) => (
        <div
          className={`ticket-container ${
            isAvailable(ticketDefinition) ? "available" : "unavailable"
          }`}
        >
          <div className="ticket-name">{ticketDefinition.name}</div>
          <div className="ticket-price">
            {formatPrice(ticketDefinition.price || 0)}
          </div>
        </div>
      ))}
    </>
  );
};

const formatPrice = (price: number) => {
  return price.toFixed(2);
};
