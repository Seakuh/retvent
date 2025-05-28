import { X } from "lucide-react";
import { useEffect, useState } from "react";
import "./UploadImageModal.css";

interface UploadImagesModalProps {
  uploadedImages: string[];
  onClose: () => void;
  onConfirm: (selectedImages: string[]) => void;
  onImageUploaded: (image: File) => void;
}

const ImageWithFallback = ({
  url,
  proxyUrl,
}: {
  url: string;
  proxyUrl: string;
}) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="image-error">
        <p>Image not loaded</p>
        <a
          className="image-error-link"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View original
        </a>
      </div>
    );
  }

  return (
    <img
      src={proxyUrl}
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
  onImageUploaded,
}: UploadImagesModalProps) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageCache, setImageCache] = useState<
    Record<string, { blob: Blob; url: string }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageUrl)
        ? prev.filter((url) => url !== imageUrl)
        : [...prev, imageUrl]
    );

    console.log(selectedImages);
  };

  useEffect(() => {
    const loadImage = async (url: string) => {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(
        url
      )}`;
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("Bild konnte nicht geladen werden");
        const blob = await response.blob();
        return { blob, url: proxyUrl };
      } catch (error) {
        console.error("Fehler beim Laden des Bildes:", error);
        return null;
      }
    };

    const loadAllImages = async () => {
      setIsLoading(true);
      const newCache: Record<string, { blob: Blob; url: string }> = {};

      for (const image of uploadedImages) {
        const match = image.match(/https:\/\/[^,]*/);
        if (match) {
          const imageUrl = match[0];
          const data = await loadImage(imageUrl);
          if (data) {
            newCache[imageUrl] = data;
          }
        }
      }

      setImageCache(newCache);
      setIsLoading(false);
    };

    loadAllImages();
  }, [uploadedImages]);

  const handleConfirm = async () => {
    try {
      const uploadPromises = selectedImages.map(async (url) => {
        const cachedData = imageCache[url];
        if (!cachedData) {
          throw new Error(`Keine Bilddaten gefunden für ${url}`);
        }

        const filename = url.split("/").pop() || "image.jpg";
        const file = new File([cachedData.blob], filename, {
          type: cachedData.blob.type || "image/jpeg",
        });

        if (cachedData.blob.size === 0) {
          throw new Error(`Ungültiges Blob für ${url}`);
        }

        console.log("Uploading file:", {
          name: file.name,
          type: file.type,
          size: file.size,
        });

        await onImageUploaded(file);
      });

      await Promise.all(uploadPromises);
      onConfirm(selectedImages);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der Bilder:", error);
    }
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
          {isLoading ? (
            <div className="loading-indicator">Bilder werden geladen...</div>
          ) : (
            uploadedImages.map((image, index) => {
              const match = image.match(/https:\/\/[^,]*/);
              if (!match) return null;
              const imageUrl = match[0];
              const isSelected = selectedImages.includes(imageUrl);
              const cachedData = imageCache[imageUrl];

              if (!cachedData) return null;

              return (
                <div
                  key={index}
                  className={`image-wrapper ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleImageSelection(imageUrl)}
                >
                  <img
                    src={cachedData.url}
                    alt="Uploaded"
                    className="uploaded-image"
                  />
                  <div className="selection-indicator">
                    {isSelected && <div className="checkmark">✓</div>}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="modal-footer">
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={selectedImages.length === 0 || isLoading}
          >
            Confirm Selection ({selectedImages.length})
          </button>
        </div>
      </div>
    </div>
  );
};
