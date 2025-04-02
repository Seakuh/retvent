import { Camera, FilePlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import { uploadEventImage } from "../components/EventScanner/service";
import { ProcessingAnimation } from "../components/ProcessingAnimation/ProcessingAnimation";
import { UploadAnimation } from "../components/UploadAnimation/UploadAnimation";
import "./UploadModal.css";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
}: UploadModalProps) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.length) return;

    const image = event.target.files[0];
    startUpload(image);
  };

  const startUpload = async (image: File) => {
    setIsUploading(true);
    setProgress(25);
    setError(null);

    const interval = setProgressInterval();

    try {
      const eventResponse = await uploadEventImage(image);
      if (!eventResponse) {
        setError(
          "Das Bild konnte nicht erkannt werden. Bitte versuchen Sie es mit einem anderen Bild."
        );
      } else {
        setProgress(100);
        setUploadedEvent(eventResponse);
      }
    } catch (err) {
      setError(
        "Es gab ein Problem beim Hochladen des Bildes. Bitte versuchen Sie es später erneut."
      );
    } finally {
      clearInterval(interval);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

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

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-content">
        <div className="upload-buttons">
          <button
            className="upload-button camera-button"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera size={24} />
            <span>Open Camera</span>
          </button>

          <button
            className="upload-button file-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={24} />
            <span>Select File</span>
          </button>
          <button
            className="upload-button file-button"
            onClick={() => navigate("/admin/events/create")}
          >
            <FilePlus size={24} />
            <span>Create Classic</span>
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden-input"
          onChange={handleFileChange}
        />

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          className="hidden-input"
          onChange={handleFileChange}
        />

        {isUploading && (
          <UploadAnimation isUploading={isUploading} progress={progress} />
        )}
        {isProcessing && <ProcessingAnimation />}
        {uploadedEvent && <Navigate to={`/event/${uploadedEvent.id}`} />}
        {error && (
          <ErrorDialog message={error} onClose={() => setError(null)} />
        )}
      </div>
    </div>
  );
};
