import { API_URL, TicketDefinition } from "../../../../utils";

export const createTicketDefinition = async (
  ticketDefinition: TicketDefinition
) => {
  const access_token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}/ticket-definitions`, {
    method: "POST",
    body: JSON.stringify(ticketDefinition),
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};
