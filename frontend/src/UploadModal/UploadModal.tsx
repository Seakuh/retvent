/**
 * UploadModal Component
 *
 * A modal interface for uploading event images either via camera or file selection.
 * Once a file is selected, it displays upload progress and handles success/error states.
 */
import { Camera, Link, Upload } from "lucide-react";
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

  const handleImageUrlsSubmit = async () => {
    if (!imageUrls.trim()) {
      setError("Please enter at least one image URL.");
      return;
    }

    const urls = imageUrls.split(",").map((url) => url.trim());
    setUploadedImages(urls);
  };

  const handleConfirmImages = (selectedImages: string[]) => {
    // Hier können Sie die ausgewählten Bilder verarbeiten
    console.log("Selected images:", selectedImages);
    setUploadedImages([]);
    onClose();
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
                <Link size={24} />
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
        />
      )}

      {/* Close button */}
      {/* <button className="upload-modal-close-button" onClick={onClose}>
        <X size={35} />
      </button> */}
    </div>
  );
};
