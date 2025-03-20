import { Heart, List } from "lucide-react";
import React from "react";
import { ViewMode } from "../../types/event";
import "./ViewToggle.css";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  view,
  onViewChange,
}) => {
  return (
    <div className="view-toggle">
      <button
        className={`toggle-button ${view === "list" ? "active" : ""}`}
        onClick={() => onViewChange("list")}
      >
        <List size={20} />
        <span>All</span>
      </button>
      <button
        className={`toggle-button ${view === "map" ? "active" : ""}`}
        onClick={() => onViewChange("map")}
      >
        <Heart size={20} />
        <span>Liked</span>
      </button>
    </div>
  );
};
