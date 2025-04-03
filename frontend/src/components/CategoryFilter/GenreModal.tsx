import { categories } from "../../utils";
import "./GenreModal.css";

interface GenreModalProps {
  genres: string[];
  onGenreSelect: (genre: string) => void;
  selectedGenre: string | null;
}

export const GenreModal = ({
  genres,
  onGenreSelect,
  selectedGenre,
}: GenreModalProps) => {
  const categoryEmojiMap = categories.reduce(
    (acc, category) => ({
      ...acc,
      [category.name]: category.emoji,
    }),
    {} as Record<string, string>
  );

  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      onGenreSelect(selectedGenre || "");
    }
  };

  return (
    <div className="genre-modal-overlay" onClick={handleOverlayClick}>
      <div className="genre-modal">
        <ul className="genre-list" onClick={handleOverlayClick}>
          {genres.map((genre) => (
            <li
              key={genre}
              className={`genre-bubble ${
                selectedGenre === genre ? "selected" : ""
              }`}
              onClick={() => onGenreSelect(genre)}
            >
              {categoryEmojiMap[genre] || "❓"} {genre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
