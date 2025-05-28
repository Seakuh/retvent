/**
 * UploadModal Component
 *
 * A modal interface for uploading event images either via camera or file selection.
 * Once a file is selected, it displays upload progress and handles success/error states.
 */
import { Camera, Import, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import { uploadEventImage } from "../components/EventScanner/service";
import { ProcessingAnimation } from "../components/ProcessingAnimation/ProcessingAnimation";
import { UploadAnimation } from "../components/UploadAnimation/UploadAnimation";
import { UploadImagesModal } from "./UploadImagesModal";
import "./UploadModal.css";

/**
 * Props for the UploadModal component
 */
interface UploadModalProps {
  isOpen: boolean; // Controls visibility of the modal
  onClose: () => void; // Callback to close the modal
  onUpload: (file: File) => void; // Callback when a file is uploaded
}

/**
 * UploadModal provides a user interface for uploading event images
 * with options to capture from camera or select from file system
 */
export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
}: UploadModalProps) => {
  // Exit early if modal is not open
  if (!isOpen) return null;

  // State management
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrls, setImageUrls] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  /**
   * Handles file selection from either camera or file system
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.length) return;

    const image = event.target.files[0];
    startUpload(image);
  };

  /**
   * Initiates the upload process and manages the upload state
   */
  const startUpload = async (image: File) => {
    setIsUploading(true);
    setProgress(25);
    setError(null);

    const interval = setProgressInterval();

    try {
      // Attempt to upload the image and process the event
      const eventResponse = await uploadEventImage(image);

      if (!eventResponse) {
        setError(
          "The image could not be recognized. Please try with a different image."
        );
      } else {
        setProgress(100);
        setUploadedEvent(eventResponse);
      }
    } catch (err) {
      setError(
        "There was a problem uploading the image. Please try again later."
      );
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  /**
   * Creates and returns an interval that simulates upload progress
   */
  const setProgressInterval = () => {
    const isUploading = true;
    const getRandomProgress = () => Math.floor(Math.random() * 4) + 5;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95 || !isUploading) {
          setIsProcessing(true);
          return prev;
        }
        return Math.min(prev + getRandomProgress(), 95);
      });
    }, 300);

    return interval;
  };

  const proxyServices = [
    // SoundCloud-spezifischer Service
    (url: string) => {
      if (url.includes("soundcloud.com")) {
        // Extrahiere die Track-ID aus der URL
        const trackId = url.split("/").pop();
        return `https://i1.sndcdn.com/artworks-${trackId}-large.jpg`;
      }
      return url;
    },
    // Allgemeine Proxy-Services
    (url: string) => `https://images.weserv.nl/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url: string) =>
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  ];

  // Hilfsfunktion zum Erkennen von SoundCloud-URLs
  const isSoundCloudUrl = (url: string) => {
    return url.includes("soundcloud.com");
  };

  const handleImageUrlsSubmit = async () => {
    if (!imageUrls.trim()) {
      setError("Please enter at least one image URL.");
      return;
    }

    const urls = imageUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
    setUploadedImages(urls);

    try {
      const imageFiles = await Promise.all(
        urls.map(async (url, index) => {
          try {
            let response;

            // Spezielle Behandlung für SoundCloud-URLs
            if (isSoundCloudUrl(url)) {
              // Versuche zuerst den SoundCloud-spezifischen Proxy
              try {
                const soundCloudUrl = proxyServices[0](url);
                response = await fetch(soundCloudUrl);
                if (!response.ok) {
                  // Fallback auf andere Proxies
                  for (const proxyService of proxyServices.slice(1)) {
                    try {
                      const proxyUrl = proxyService(url);
                      response = await fetch(proxyUrl);
                      if (response.ok) break;
                    } catch (error) {
                      continue;
                    }
                  }
                }
              } catch (error) {
                console.error("SoundCloud proxy failed:", error);
                // Fallback auf andere Proxies
                for (const proxyService of proxyServices.slice(1)) {
                  try {
                    const proxyUrl = proxyService(url);
                    response = await fetch(proxyUrl);
                    if (response.ok) break;
                  } catch (error) {
                    continue;
                  }
                }
              }
            } else {
              // Normale Proxy-Behandlung für andere URLs
              for (const proxyService of proxyServices) {
                try {
                  const proxyUrl = proxyService(url);
                  response = await fetch(proxyUrl);
                  if (response.ok) break;
                } catch (error) {
                  continue;
                }
              }
            }

            if (!response || !response.ok) {
              throw new Error("Failed to fetch image");
            }

            const blob = await response.blob();
            const fileName = url.split("/").pop() || `image-${Date.now()}.jpg`;

            setProgress(((index + 1) / urls.length) * 50);

            return new File([blob], fileName, { type: blob.type });
          } catch (error) {
            console.error(`Fehler beim Herunterladen von ${url}:`, error);
            return null;
          }
        })
      );

      const validFiles = imageFiles.filter(
        (file): file is File => file !== null
      );

      if (validFiles.length === 0) {
        return;
      }

      setIsUploading(false);
    } catch (error) {
      setError("Fehler beim Verarbeiten der Bilder.");
      console.error(error);
      setIsUploading(false);
    }
  };

  const handleConfirmImages = (selectedImages: string[]) => {
    // Hier können Sie die ausgewählten Bilder verarbeiten
    // Zum Beispiel:
    // try {
    //   uploadEventImageUrls(selectedImages);
    // } catch (error) {
    //   console.error("Error uploading images:", error);
    // }
    // selectedImages.forEach((imageUrl) => {
    //   // Hier können Sie die Bilder an Ihren Backend-Service senden
    //   // oder andere Verarbeitung durchführen
    //   console.log("Processing image:", imageUrl);
    //   const image = new File([], imageUrl, { type: "image/jpeg" });
    //   // startUpload(image);
    //   console.log("image", image);
    // });
    // setUploadedImages([]);
  };

  const handleImageUploaded = (image: File) => {
    startUpload(image);
  };

  return (
    <div>
      {!isUploading && !isProcessing && (
        <div className="upload-modal-overlay" onClick={onClose}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-content">
              <div className="upload-buttons">
                {/* Camera access button */}
                <button
                  className="upload-button camera-button"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={24} />
                  <span>Open Camera</span>
                </button>

                {/* File system access button */}
                <button
                  className="upload-button file-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} />
                  <span>Select File</span>
                </button>

                {/* URL input section */}
                <div className="url-input-section">
                  <input
                    type="text"
                    placeholder="Image URLs (comma separated)"
                    value={imageUrls}
                    onChange={(e) => setImageUrls(e.target.value)}
                    className="url-input"
                  />
                </div>
              </div>
              <button
                className="upload-button url-button"
                onClick={handleImageUrlsSubmit}
              >
                <Import size={24} />
                <span>Process URLs</span>
              </button>
            </div>

            {/* Hidden file input for file system selection */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden-input"
              onChange={handleFileChange}
            />

            {/* Hidden file input for camera capture */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              className="hidden-input"
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
      {/* Upload progress animation */}
      {isUploading && !isProcessing && (
        <UploadAnimation isUploading={isUploading} progress={progress} />
      )}

      {/* Processing animation after upload completes */}
      {isProcessing && <ProcessingAnimation />}

      {/* Navigation after successful upload */}
      {uploadedEvent && <Navigate to={`/event/${uploadedEvent.id}`} />}

      {/* Error dialog for upload failures */}
      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}

      {uploadedImages.length > 0 && (
        <UploadImagesModal
          uploadedImages={uploadedImages}
          onClose={() => setUploadedImages([])}
          onConfirm={handleConfirmImages}
          onImageUploaded={handleImageUploaded}
        />
      )}

      {/* Close button */}
      {/* <button className="upload-modal-close-button" onClick={onClose}>
        <X size={35} />
      </button> */}
    </div>
  );
};
