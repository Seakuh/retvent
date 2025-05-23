import { Ticket } from "../../../../utils";

export const Tickets = (ticket: Ticket) => {
  console.log(ticket);

  return <div>{ticket.name}</div>;
};
