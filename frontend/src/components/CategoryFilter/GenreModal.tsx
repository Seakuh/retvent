import { useState } from "react";
import { categories } from "../../utils";
import "./GenreModal.css";

interface GenreModalProps {
  showGenreModal: boolean;
  genres: string[];
}

export const GenreModal = ({ showGenreModal, genres }: GenreModalProps) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const onGenreBubbleClicked = (genre: string) => {
    setSelectedGenre(genre);
  };

  const categoryEmojiMap = categories.reduce(
    (acc, category) => ({
      ...acc,
      [category.name]: category.emoji,
    }),
    {} as Record<string, string>
  );

  if (!showGenreModal) return null;

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
              onClick={() => onGenreBubbleClicked(genre)}
            >
              {categoryEmojiMap[genre] || "❓"}
              {genre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
