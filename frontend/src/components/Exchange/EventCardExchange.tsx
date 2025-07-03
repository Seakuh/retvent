import { useState } from "react";
import { Event } from "../../utils";
import "./EventCardExchange.css";

export const EventCardExchange = ({ event }: { event: Event }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBuy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("buy");
    console.log(localStorage.getItem("solanaWalletAddress"));
    console.log(event);
    setIsOpen(true);
  };

  return (
    <div className="event-card-exchange">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleBuy(e);
        }}
        className="event-card-exchange-button"
      >
        Buy
      </button>
    </div>
  );
};
