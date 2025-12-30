import React, { useEffect, useRef, useState } from "react";
import { SocialSearchButtons } from "./SocialSearchButtons";
import "./EventDescription.css";

interface EventDescriptionProps {
  title: string;
  description?: string;
  price?: string;
  ticketLink?: string;
}

export const EventDescription: React.FC<EventDescriptionProps> = ({
  title,
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
      const maxHeight = lineHeight * 4;
      setIsOverflowing(height > maxHeight);
    }
  }, [description]);

  if (!description) return null;

  return (
    <div className="event-description-container">
      <div
        className="event-description-section"
      >
        <div className="event-detail-description-text" ref={textRef}>
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="description-paragraph">
              {paragraph || '\u00A0'}
            </p>
          ))}
        </div>
        {/* {isOverflowing &&
          (expanded ? (
            <div className="expand-hint">
              <ChevronUp className="more-info-icon h-5 w-5" />
            </div>
          ) : (
            <div className="expand-hint">
              <ChevronDown className="more-info-icon h-5 w-5" />
            </div>
          ))} */}
      <SocialSearchButtons title={title} />
      </div>
    </div>
  );
};
