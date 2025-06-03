/**
 * UploadModal Component
 *
 * A modal interface for uploading event images either via camera or file selection.
 * Once a file is selected, it displays upload progress and handles success/error states.
 */
import { Camera, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import {
  uploadEventImage,
  uploadEventImages,
} from "../components/EventScanner/service";
import { ProcessingAnimation } from "../components/ProcessingAnimation/ProcessingAnimation";
import { UploadAnimation } from "../components/UploadAnimation/UploadAnimation";
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
  const navigate = useNavigate();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setProgress(25);
    setError(null);

    const interval = setProgressInterval();

    try {
      const eventResponses = await uploadEventImages(selectedFiles);

      if (!eventResponses || eventResponses.length === 0) {
        setError(
          "The images could not be recognized. Please try again with different images."
        );
      } else {
        setProgress(100);
        setUploadedEvent(eventResponses[0]); // Navigate to the first event
      }
    } catch (err) {
      setError(
        "There was a problem uploading the images. Please try again later."
      );
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {!isUploading && !isProcessing && (
        <div className="upload-modal-overlay" onClick={onClose}>
          <div onClick={(e) => e.stopPropagation()}>
            <div className="upload-modal-content">
              <div
                className={`upload-dropzone ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
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
                  <p className="drag-drop-text">Drag & Drop here</p>
                  {/* <button
                    className="upload-button create-advertisement-button"
                    onClick={() => navigate("/create-advertisement")}
                  >
                    <Image size={24} />
                    <span>Drop Images Here</span>
                  </button> */}
                </div>

                {previewImages.length > 0 && (
                  <>
                    <div className="preview-container">
                      {previewImages.map((image, index) => (
                        <div key={index} className="preview-item">
                          <img src={image} alt={`Preview ${index + 1}`} />
                          <button
                            className="remove-image"
                            onClick={() => removeImage(index)}
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="upload-all-button"
                      onClick={handleUpload}
                    >
                      Upload all images
                    </button>
                  </>
                )}
              </div>
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

      {/* Close button */}
      {/* <button className="upload-modal-close-button" onClick={onClose}>
        <X size={35} />
      </button> */}
    </div>
  );
};
