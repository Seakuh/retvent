import { X } from "lucide-react";
import { useEffect, useState } from "react";
import "./UploadImageModal.css";

export const UploadImagesModal = ({
  uploadedImages,
  onClose,
}: {
  uploadedImages: string[];
  onClose: () => void;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  console.log(uploadedImages);

  const ImageWithFallback = ({ url }: { url: string }) => {
    const [imageUrl, setImageUrl] = useState<string>(url);
    const [error, setError] = useState(false);

    const proxyServices = [
      (url: string) =>
        `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
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
          <p>Bild konnte nicht geladen werden</p>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Link zum Original
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

  return (
    <div className="upload-images-modal">
      <button className="close-button" onClick={onClose}>
        <X size={35} />
      </button>
      <div className="images-container">
        {uploadedImages.map((image, index) => {
          const match = image.match(/https:\/\/[^,]*/);
          if (!match) return null;
          return <ImageWithFallback key={index} url={match[0]} />;
        })}
      </div>
    </div>
  );
};
