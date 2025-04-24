import { ClockIcon, FilmIcon, ImageIcon, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./OwnerComponent.css";
import { addGifs, addLineup, addTeaser } from "./service";

export const OwnerComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { eventId } = useParams();
  const navigate = useNavigate();
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      switch (type) {
        case "lineup":
          await addLineup(eventId!, file);
          break;
        case "images":
          await addGifs(eventId!, file);
          break;
        case "video":
          await addTeaser(eventId!, file);
          break;
        case "update":
          navigate(`/admin/events/edit/${eventId}`);
          break;
      }

      console.log("Upload erfolgreich");
    } catch (error) {
      console.error("Fehler beim Upload:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/events/edit/${eventId}`);
  };

  const handleOpen = (type: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = type === "video" ? "video/*" : "image/*";
    fileInput.onchange = (e) =>
      handleFileUpload(e as React.ChangeEvent<HTMLInputElement>, type);
    fileInput.click();
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
        onClick={handleEdit}
      >
        <PencilIcon className="h-10 w-10" />
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
        title="Add Images"
        onClick={() => handleOpen("images")}
      >
        <ImageIcon className="h-10 w-10" />
      </button>

      {/* Teaser Video hinzufügen */}
      <button
        className="event-owner-info-button"
        title="Add Video"
        onClick={() => handleOpen("video")}
      >
        <FilmIcon className="h-10 w-10" />
      </button>
    </div>
  );
};
