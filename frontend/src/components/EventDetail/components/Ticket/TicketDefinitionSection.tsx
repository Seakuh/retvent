import React, { useState } from "react";
import "./TicketDefinitionSection.css";

interface TicketDefinition {
  name: string;
  description: string;
  price: number;
  availableTickets: number;
  startDate: string;
  endDate: string;
}

export const TicketDefinitionSection: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDefinition[]>([
    {
      name: "",
      description: "",
      price: 0,
      availableTickets: 0,
      startDate: "",
      endDate: "",
    },
  ]);

  const addTicket = () => {
    setTickets([
      ...tickets,
      {
        name: "",
        description: "",
        price: 0,
        availableTickets: 0,
        startDate: "",
        endDate: "",
      },
    ]);
  };

  const handleTicketChange = (
    index: number,
    field: keyof TicketDefinition,
    value: string | number
  ) => {
    const newTickets = [...tickets];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTickets(newTickets);
  };

  const handleCreateTickets = async () => {
    console.log(tickets);
  };

  return (
    <div className="ticket-definition">
      <h1 className="section-title">Create Tickets</h1>
      {tickets.map((ticket, index) => (
        <div key={index} className="ticket-row">
          <input
            type="text"
            placeholder="Ticket Name"
            value={ticket.name}
            onChange={(e) => handleTicketChange(index, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={ticket.availableTickets}
            onChange={(e) =>
              handleTicketChange(
                index,
                "availableTickets",
                parseInt(e.target.value)
              )
            }
          />
          <input
            type="datetime-local"
            value={ticket.startDate}
            onChange={(e) =>
              handleTicketChange(index, "startDate", e.target.value)
            }
          />
          <input
            type="datetime-local"
            value={ticket.endDate}
            onChange={(e) =>
              handleTicketChange(index, "endDate", e.target.value)
            }
          />
        </div>
      ))}
      <div className="button-container">
        <button onClick={addTicket}>+ Add Ticket</button>
        <button onClick={handleCreateTickets}>Create Tickets</button>
      </div>
    </div>
  );
};
