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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current && description) {
      // Warte kurz, damit das DOM gerendert ist
      setTimeout(() => {
        if (textRef.current) {
          const fullHeight = textRef.current.scrollHeight;
          const computedStyle = window.getComputedStyle(textRef.current);
          const lineHeight = parseFloat(computedStyle.lineHeight) || 
            parseFloat(computedStyle.fontSize) * 1.6;
          const maxHeight = lineHeight * 5;
          setIsOverflowing(fullHeight > maxHeight);
        }
      }, 0);
    }
  }, [description]);

  if (!description) return null;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      ref={containerRef}
      className="event-description-container"
      onClick={isOverflowing ? toggleExpanded : undefined}
      style={{ cursor: isOverflowing ? 'pointer' : 'default' }}
    >
      <div
        className={`event-description-section ${expanded ? "expanded" : "collapsed"}`}
      >
        <div className="event-detail-description-text" ref={textRef}>
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="description-paragraph">
              {paragraph || '\u00A0'}
            </p>
          ))}
        </div>
        {isOverflowing && (
          <div className="expand-toggle-button">
            {expanded ? "less..." : "more..."}
          </div>
        )}
        <SocialSearchButtons title={title} />
      </div>
    </div>
  );
};
