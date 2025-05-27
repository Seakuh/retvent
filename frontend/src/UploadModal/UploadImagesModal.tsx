import { X } from "lucide-react";
import { useEffect, useState } from "react";
import "./UploadImageModal.css";

interface UploadImagesModalProps {
  uploadedImages: string[];
  onClose: () => void;
  onConfirm: (selectedImages: string[]) => void;
}

const ImageWithFallback = ({ url }: { url: string }) => {
  const [imageUrl, setImageUrl] = useState<string>(url);
  const [error, setError] = useState(false);

  const proxyServices = [
    (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
    (url: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  ];

  useEffect(() => {
    let currentIndex = 0;

    const tryNextProxy = () => {
      if (currentIndex < proxyServices.length) {
        setImageUrl(proxyServices[currentIndex](url));
        currentIndex++;
      }
    };

    const handleError = () => {
      if (currentIndex < proxyServices.length) {
        tryNextProxy();
      } else {
        setError(true);
      }
    };

    tryNextProxy();
  }, [url]);

  if (error) {
    return (
      <div className="image-error">
        <p>Image could not be loaded</p>
        <a href={url} target="_blank" rel="noopener noreferrer">
          View original
        </a>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Uploaded"
      onError={() => setError(true)}
      className="uploaded-image"
    />
  );
};

export const UploadImagesModal = ({
  uploadedImages,
  onClose,
  onConfirm,
}: UploadImagesModalProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );

    console.log(selectedImages);
  };

  const handleConfirm = () => {
    onConfirm(selectedImages);
  };

  return (
    <div className="upload-images-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Select Images</h2>
          <p>{selectedImages.length} images selected</p>
        </div>

        <div className="images-container">
          {uploadedImages.map((image, index) => {
            const match = image.match(/https:\/\/[^,]*/);
            if (!match) return null;
            const imageUrl = match[0];
            const isSelected = selectedImages.includes(imageUrl);

            return (
              <div
                key={index}
                className={`image-wrapper ${isSelected ? "selected" : ""}`}
                onClick={() => toggleImageSelection(imageUrl)}
              >
                <ImageWithFallback url={imageUrl} />
                <div className="selection-indicator">
                  {isSelected && <div className="checkmark">✓</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={selectedImages.length === 0}
          >
            Confirm Selection ({selectedImages.length})
          </button>
        </div>
      </div>
    </div>
  );
};
