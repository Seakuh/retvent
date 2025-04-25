import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./EventDescription.css";

interface EventDescriptionProps {
  title: string;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(textRef.current).lineHeight
      );
      const height = textRef.current.scrollHeight;
      const maxHeight = lineHeight * 3;
      setIsOverflowing(height > maxHeight);
    }
  }, [description]);

  if (!description) return null;

  return (
    <div className="event-description-container">
      <div
        className={`event-description-section ${
          expanded ? "expanded" : "collapsed"
        }`}
        onClick={() => isOverflowing && setExpanded(!expanded)}
      >
        <div className="event-description-text" ref={textRef}>
          {description}
        </div>
        {isOverflowing &&
          (expanded ? (
            <div className="expand-hint">
              <ChevronUp className="more-info-icon h-5 w-5" />
            </div>
          ) : (
            <div className="expand-hint">
              <ChevronDown className="more-info-icon h-5 w-5" />
            </div>
          ))}
      </div>
    </div>
  );
};
