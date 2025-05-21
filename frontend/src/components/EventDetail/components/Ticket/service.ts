import { TICKET_API_URL, TicketDefinition } from "../../../../utils";

export const createTicketDefinition = async (
  ticketDefinitions: TicketDefinition[]
) => {
  const access_token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${TICKET_API_URL}ticket/definitions`, {
      method: "POST",
      body: JSON.stringify(ticketDefinitions),
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    return response.json();
  } catch (error) {
    console.error("Error creating ticket definition:", error);
  }
};
