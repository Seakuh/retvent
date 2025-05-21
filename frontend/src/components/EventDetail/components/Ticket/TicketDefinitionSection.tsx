import { Plus, Ticket, Trash } from "lucide-react";
import React, { useState } from "react";
import { TicketDefinition } from "../../../../utils";
import { createTicketDefinition } from "./service";
import "./TicketDefinitionSection.css";

export const TicketDefinitionSection: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDefinition[]>([
    {
      name: "",
      price: 0,
      availableFrom: new Date(),
      availableUntil: new Date(),
    },
  ]);

  const addTicket = () => {
    setTickets([
      ...tickets,
      {
        name: "",
        price: 0,
        amount: 0,
        availableFrom: new Date(),
        availableUntil: new Date(),
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
    await createTicketDefinition(tickets);
  };

  const deleteTicket = (index: number) => {
    const newTickets = tickets.filter((_, i) => i !== index);
    setTickets(newTickets);
  };

  return (
    <div className="ticket-definition">
      <h1 className="section-title">Tickets</h1>
      {tickets.map((ticket, index) => (
        <div>
          <div key={index} className="ticket-row">
            <div className="ticket-inputs">
              <input
                type="text"
                placeholder="Ticket Name"
                value={ticket.name}
                onChange={(e) =>
                  handleTicketChange(index, "name", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Price"
                value={ticket.price}
                onChange={(e) =>
                  handleTicketChange(index, "price", parseInt(e.target.value))
                }
              />
              <input
                type="number"
                placeholder="Amount"
                value={ticket.amount}
                onChange={(e) =>
                  handleTicketChange(index, "amount", parseInt(e.target.value))
                }
              />
              <input
                type="datetime-local"
                value={ticket.availableFrom}
                onChange={(e) =>
                  handleTicketChange(index, "availableFrom", e.target.value)
                }
              />
              <input
                type="datetime-local"
                value={ticket.availableUntil}
                onChange={(e) =>
                  handleTicketChange(index, "availableUntil", e.target.value)
                }
              />
            </div>
          </div>
          <button
            className="delete-button"
            onClick={() => deleteTicket(index)}
            aria-label="Delete ticket"
          >
            <Trash className="h-10 w-10" />
          </button>
        </div>
      ))}
      <div className="button-container">
        <button className="add-ticket-button" onClick={addTicket}>
          <Plus className="h-10 w-10" />
        </button>
        <button className="create-tickets-button" onClick={handleCreateTickets}>
          <Ticket className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
};
