import { Camera, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog/ErrorDialog";
import { uploadEventImage } from "../components/EventScanner/service";
import { ProcessingAnimation } from "../components/ProcessingAnimation/ProcessingAnimation";
import { UploadAnimation } from "../components/UploadAnimation/UploadAnimation";

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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "file" | "camera" | null
  >(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files?.length) return;

    const image = event.target.files[0];
    startUpload(image);
  };

  const handleCameraCapture = async () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.capture = "environment";
    fileInputRef.current.click();
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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
        <div className="space-y-4">
          <button
            onClick={() => handleCameraCapture()}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 
                     text-white p-4 rounded-xl text-lg font-medium transition-colors"
          >
            <Camera size={24} />
            Open Camera
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 
                     text-white p-4 rounded-xl text-lg font-medium transition-colors"
          >
            <Upload size={24} />
            Select File
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          className="hidden"
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
