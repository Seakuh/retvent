import { Plus, Save, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { TicketDefinition } from "../../../../utils";
import {
  createTicketDefinition,
  deleteTicketDefinition,
  getTicketDefinitions,
} from "./service";
import "./TicketDefinitionSection.css";

export const TicketDefinitionSection: React.FC<{ eventId: string }> = ({
  eventId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tickets, setTickets] = useState<TicketDefinition[]>([
    {
      eventId: eventId,
      name: "",
      price: undefined,
      availableTickets: undefined,
      availableFrom: new Date(),
      availableUntil: new Date(),
    },
  ]);

  const addTicket = () => {
    setErrorMessage("");
    setTickets([
      ...tickets,
      {
        eventId: eventId,
        availableTickets: undefined,
        name: "",
        price: undefined,
        availableFrom: new Date(),
        availableUntil: new Date(),
      },
    ]);
  };

  useEffect(() => {
    const fetchTicketDefinitions = async () => {
      const ticketDefinitions = await getTicketDefinitions(eventId);
      setTickets(ticketDefinitions);
    };
    fetchTicketDefinitions();
  }, [eventId]);

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
    try {
      const validTickets = tickets.filter(
        (ticket) =>
          ticket.name &&
          ticket.price !== undefined &&
          ticket.availableTickets !== undefined &&
          ticket.availableFrom &&
          ticket.availableUntil
      );

      if (validTickets.length === 0) {
        setErrorMessage("Bitte fülle mindestens ein Ticket vollständig aus.");
        return;
      }

      const response = await createTicketDefinition(validTickets);
      if (!response.ok && response.statusCode === 500) {
        setErrorMessage(
          "Internal server error occurred. Please try again later."
        );
        return;
      }
      console.log(response);
      alert("Tickets created successfully");
      setTickets(response);
    } catch (error) {
      setErrorMessage("Error creating tickets: " + error);
    }
  };

  const deleteTicket = async (index: number) => {
    if (window.confirm("Do you want to delete this ticket?")) {
      console.log(tickets[index]);
      const newTickets = tickets.filter((_, i) => i !== index);
      if (tickets[index]._id) {
        try {
          await deleteTicketDefinition(tickets[index]._id);
          setTickets(newTickets);
        } catch (error) {
          setErrorMessage("Error deleting ticket: " + error);
        }
      }
    }
  };

  return (
    <div className="ticket-definition">
      <h1 className="section-title">Tickets</h1>
      {tickets.map((ticket, index) => {
        try {
          return (
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
                      handleTicketChange(
                        index,
                        "price",
                        parseInt(e.target.value)
                      )
                    }
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
                    className="ticket-input-date"
                    type="datetime-local"
                    value={ticket.availableFrom}
                    onChange={(e) =>
                      handleTicketChange(index, "availableFrom", e.target.value)
                    }
                    style={{ color: "white" }}
                  />
                  <input
                    className="ticket-input-date"
                    type="datetime-local"
                    value={ticket.availableUntil}
                    onChange={(e) =>
                      handleTicketChange(
                        index,
                        "availableUntil",
                        e.target.value
                      )
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
          );
        } catch (error) {
          return <div>Error: {error}</div>;
        }
      })}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
      <div className="button-container">
        <button className="add-ticket-button" onClick={addTicket}>
          <Plus className="h-10 w-10" />
        </button>
        <button className="create-tickets-button" onClick={handleCreateTickets}>
          <Save className="h-10 w-10" />
        </button>
      </div>
    </div>
  );
};
