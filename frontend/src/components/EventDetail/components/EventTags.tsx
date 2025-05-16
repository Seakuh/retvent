import { useNavigate } from "react-router-dom";

interface EventTagsProps {
  tags: string[];
}

export const EventTags: React.FC<EventTagsProps> = ({ tags }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/?search=${encodeURIComponent(tag)}`);
  };
  return (
    <div className="event-tags">
      <div className="tags-container">
        {tags.map((tag, index) => (
          <span key={index} className="tag" onClick={() => handleTagClick(tag)}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};
