import { useEffect } from "react";
import { ViewMode } from "../types/event";

type KeyboardShortcutsProps = {
  onSearchOpen: () => void;
  onViewChange: (view: ViewMode) => void;
};

export const useKeyboardShortcuts = ({
  onSearchOpen,
  onViewChange,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case "l":
          e.preventDefault();
          onSearchOpen();
          break;
        case "h":
          e.preventDefault();
          onViewChange("Home");
          break;
        case "a":
          e.preventDefault();
          onViewChange("All");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onSearchOpen, onViewChange]);
};
