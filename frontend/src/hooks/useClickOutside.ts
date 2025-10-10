import { useEffect } from "react";

export const useClickOutside = (
  isOpen: boolean,
  onClose: () => void,
  selectors: { button: string; container: string }
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const button = document.querySelector(selectors.button);
      const container = document.querySelector(selectors.container);

      const clickedOutside =
        container &&
        !container.contains(event.target as Node) &&
        button &&
        !button.contains(event.target as Node);

      if (clickedOutside) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, selectors.button, selectors.container]);
};
