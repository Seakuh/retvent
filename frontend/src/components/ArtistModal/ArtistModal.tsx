import { ChevronLeft, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ArtistModal.css";
import { setUpNewArtist } from "./service";

export const ArtistModal = ({
  onClose,
  artistName,
}: {
  onClose: () => void;
  artistName: string;
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [description, setDescription] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (selectedImages.length > 0) {
      const response = await setUpNewArtist(
        artistName,
        selectedImages[0], // assuming you still only submit one main image
        description
      );
      console.log(response);
    } else {
      console.log("No image selected");
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleFiles = (files: FileList) => {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    setSelectedImages((prev) => [...prev, ...imageFiles]);
  };

  return (
    <div className="artist-modal-overlay" onClick={onClose}>
      <button onClick={handleBack} className="back-button">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div
        className="artist-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="section-title">No Artist Profile found</h1>
        <h2 className="section-subtitle">Do you know {artistName}?</h2>
        {selectedImages.length > 0 && (
          <div className="image-preview-container">
            {selectedImages.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt={`Preview ${index}`}
                className="image-preview"
              />
            ))}
          </div>
        )}
        <div
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            multiple
            name="image"
            id="image"
            className="artist-image-input"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
              }
            }}
            accept="image/*"
          />
        </div>

        <div className="artist-description-input-container">
          <textarea
            name="description"
            id="description"
            className="artist-description-input"
            placeholder="Tell us about them"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button className="artist-submit-button" onClick={handleSubmit}>
          Submit
        </button>
        <div className="artist-web-search-link">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              artistName + " " + " DJ"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="artist-search-link"
          >
            <ExternalLink className="artist-search-link h-20 w-20" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArtistModal;
