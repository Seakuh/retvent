interface EventTagsProps {
  tags: string[];
}

export const EventTags: React.FC<EventTagsProps> = ({ tags }) => (
  <div className="event-tags">
    <h2>🏷️ Tags</h2>
    <div className="tags-container">
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
