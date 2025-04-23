import { ClockIcon, FilmIcon, ImageIcon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import "./OwnerComponent.css";

export const OwnerComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = (type: string) => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="event-owner-info">
      {/* Update hinzufügen */}
      <button
        className="event-owner-info-button"
        title="Add Update"
        onClick={() => handleOpen("update")}
      >
        <PlusCircleIcon className="h-10 w-10" />
      </button>
      {/* Lineup hinzufügen */}
      <button
        className="event-owner-info-button"
        title="Add Lineup"
        onClick={() => handleOpen("lineup")}
      >
        <ClockIcon className="h-10 w-10" />
      </button>

      {/* GIFs hinzufügen */}
      <button
        className="event-owner-info-button"
        title="Add GIFs"
        onClick={() => handleOpen("gifs")}
      >
        <ImageIcon className="h-10 w-10" />
      </button>

      {/* Teaser Video hinzufügen */}
      <button
        className="event-owner-info-button"
        title="Add Teaser Video"
        onClick={() => handleOpen("teaser")}
      >
        <FilmIcon className="h-10 w-10" />
      </button>
    </div>
  );
};
