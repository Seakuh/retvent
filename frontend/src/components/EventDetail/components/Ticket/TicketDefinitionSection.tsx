import { Plus, Save, Trash } from "lucide-react";
import React, { useState } from "react";
import { useTicket } from "../../../../hooks/useTicket";
import { TicketDefinition } from "../../../../utils";
import { createTicketDefinition, deleteTicketDefinition } from "./service";
import "./TicketDefinitionSection.css";
export const TicketDefinitionSection: React.FC<{ eventId: string }> = ({
  eventId,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { tickets, setTickets } = useTicket(eventId);

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
    setErrorMessage("");
    console.log(tickets);
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
        setErrorMessage("Please fill at least one ticket.");
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
      setTickets([...response]);
    } catch (error) {
      setErrorMessage("Error creating tickets: " + error);
    }
  };

  const deleteTicket = async (index: number) => {
    if (window.confirm("Do you want to delete this ticket?")) {
      const ticketToDelete = tickets[index];

      const newTickets = tickets.filter((_, i) => i !== index);

      try {
        // Extrahiere die ID aus der _doc Struktur
        const ticketId = ticketToDelete._doc?._id || ticketToDelete._id;

        if (ticketId) {
          const response = await deleteTicketDefinition(ticketId);
        } else {
          setErrorMessage("Ticket ID not found");
        }
        setTickets(newTickets);
      } catch (error) {
        setErrorMessage("Error deleting ticket: " + error);
      }
    }
  };

  const formatDateForInput = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: "YYYY-MM-DDTHH:mm"
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
                    value={formatDateForInput(
                      ticket.availableFrom || new Date()
                    )}
                    onChange={(e) =>
                      handleTicketChange(index, "availableFrom", e.target.value)
                    }
                    style={{ color: "white" }}
                  />
                  <input
                    className="ticket-input-date"
                    type="datetime-local"
                    value={formatDateForInput(
                      ticket.availableUntil || new Date()
                    )}
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
