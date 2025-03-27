import { Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import ErrorDialog from "../ErrorDialog/ErrorDialog";
import { ProcessingAnimation } from "../ProcessingAnimation/ProcessingAnimation";
import { UploadAnimation } from "../UploadAnimation/UploadAnimation";
import "./Eventscanner.css";
import { uploadEventImage } from "./service";

export const EventScanner: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      const image = event.target.files[0];

      setIsUploading(true);
      setProgress(25);
      setError(null);

      // Funktion zur zufälligen Progress-Erhöhung zwischen 2 und 5
      const getRandomProgress = () => Math.floor(Math.random() * 4) + 5; // 2 bis 5

      // Progress in einem separaten Interval hochzählen
      let isUploading = true;

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95 || !isUploading) {
            setIsProcessing(true);
            return prev; // Nicht über 95% hinausgehen, um Platz für den finalen Sprung zu lassen
          }
          return Math.min(prev + getRandomProgress(), 95);
        });
      }, 300); // Alle 300ms den Progress zufällig erhöhen

      try {
        const eventResponse = await uploadEventImage(image);

        if (!eventResponse) {
          setError(
            "The image could not be recognized. Please try again with a different image."
          );
        } else {
          isUploading = false; // Beende die Progress-Animation
          clearInterval(interval); // Interval stoppen

          // Schnell auf 100% setzen für eine realistische Animation
          setProgress(100);

          setUploadedEvent(eventResponse);
        }
      } catch (err) {
        setError(
          "There was a problem uploading the image. Please try again later."
        );
      } finally {
        isUploading = false;
        clearInterval(interval);
        setIsUploading(false);
        setIsProcessing(false);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="event-scanner">
      <button
        className="retro-button flex items-center gap-2"
        onClick={triggerFileInput}
      >
        <Upload size={35} />
        Upload Event
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* Upload Progressbar */}
      {isUploading && (
        <UploadAnimation isUploading={isUploading} progress={progress} />
      )}
      {isProcessing && <ProcessingAnimation />}
      {/* Hochgeladenes Event in Fullscreen anzeigen */}
      {uploadedEvent && <Navigate to={`/event/${uploadedEvent.id}`} />}

      {/* Error-Dialog anzeigen, wenn ein Fehler auftritt */}
      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
    </div>
  );
};
