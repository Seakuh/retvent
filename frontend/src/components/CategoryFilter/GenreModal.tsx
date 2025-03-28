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

  return (
    <div className="genre-modal-overlay">
      <div className="genre-modal">
        <ul className="genre-list">
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
