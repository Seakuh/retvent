interface EventTagsProps {
  tags: string[];
}

export const EventTags: React.FC<EventTagsProps> = ({ tags }) => (
  <div className="event-tags">
    <h2 className="section-headline">Tags</h2>
    <div className="tags-container">
      {tags.map((tag, index) => (
        <span
          key={index}
          className="tag"
          onClick={() => {
            window.open(`https://www.google.com/search?q=${tag}`, "_blank");
          }}
        >
          #{tag}
        </span>
      ))}
    </div>
  </div>
);
