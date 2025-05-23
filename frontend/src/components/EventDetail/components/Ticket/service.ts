import { TICKET_API_URL, TicketDefinition } from "../../../../utils";

export const createTicketDefinition = async (
  ticketDefinitions: TicketDefinition[]
) => {
  const access_token = localStorage.getItem("access_token");
  console.log(ticketDefinitions);
  console.log(TICKET_API_URL);
  console.log(access_token);
  try {
    const response = await fetch(`${TICKET_API_URL}ticket/definitions`, {
      method: "POST",
      body: JSON.stringify(ticketDefinitions),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error creating ticket definition:", error);
  }
};

export const getTicketDefinitions = async (eventId: string) => {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(
    `${TICKET_API_URL}ticket/definitions/by-event/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response.json();
};

export const deleteTicketDefinition = async (ticketDefinitionId: string) => {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(
    `${TICKET_API_URL}ticket/definitions/${ticketDefinitionId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );
  return response.json();
};
