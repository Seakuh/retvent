
import React from "react";
import "./EventButton.css";

interface EventButtonProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  color?: "pink" | "blue" | "green" | "purple" | "yellow";
}

const EventButton: React.FC<EventButtonProps> = ({ label, onClick, icon, color = "blue" }) => {
  return (
    <button className={`event-button event-button-${color}`} onClick={onClick}>
      {icon && <span className="icon">{icon}</span>}
      {label}
    </button>
  );
};

export default EventButton;
