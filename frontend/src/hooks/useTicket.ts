import axios from "axios";
import { useEffect, useState } from "react";
import { TicketDefinition } from "../utils";

export const useTicket = (eventId?: string) => {
  const [ticketDefinitions, setTicketDefinitions] = useState<
    TicketDefinition[]
  >([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTicketDefinitions = async (eventId: string) => {
      if (!eventId) {
        setError(new Error("No event ID provided"));
        return;
      }
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_TICKET_API_URL
          }ticket/definitions/by-event/${eventId}`
        );
        setTicketDefinitions(response.data);
        console.log(response.data);
      } catch (error) {
        setError(error as Error);
      }
    };
    if (eventId) {
      fetchTicketDefinitions(eventId);
    }
  }, [eventId]);

  return { setTicketDefinitions, ticketDefinitions, error };
};
