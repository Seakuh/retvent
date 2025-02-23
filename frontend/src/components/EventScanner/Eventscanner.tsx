import React, { useRef, useState } from "react";
import "./Eventscanner.css";
import { uploadEventImage } from "./service";
import UploadedEventCard from "../UploadedEventCard/UploadedEventCard";
import ErrorDialog from "../ErrorDialog/ErrorDialog";
import { Upload } from "lucide-react";
import { Navigate } from "react-router-dom";
import { UploadAnimation } from "../UploadAnimation/UploadAnimation";

export const EventScanner: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const image = event.target.files[0];

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        // Erst nach kurzer Verzögerung auf 75% springen
        setTimeout(() => setProgress(75), 300);
        
        const eventResponse = await uploadEventImage(image);

        if (!eventResponse) {
          setError("Das Bild konnte nicht erkannt werden. Bitte versuche es mit einem anderen Bild.");
        } else {
          // Progress bis 100 und dann erst Navigation
          await new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              setProgress(prev => {
                if (prev >= 100) {
                  clearInterval(interval);
                  resolve();
                  return 100;
                }
                return prev + 5;
              });
            }, 200); // Langsamerer Intervall für smoothere Animation
          });
          
          setUploadedEvent(eventResponse);
        }
      } catch (err) {
        setError("Es gab ein Problem beim Hochladen des Bildes. Versuche es später erneut.");
      } finally {
        setIsUploading(false);
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
      <button className="retro-button flex items-center gap-2" onClick={triggerFileInput}>
        <Upload size={35} />
        Upload Event
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange} />
      {/* Upload Progressbar */}
      {isUploading && (
        <UploadAnimation isUploading={isUploading} progress={progress} />
      )}

      {/* Hochgeladenes Event in Fullscreen anzeigen */}
      {uploadedEvent && <Navigate to={`/event/${uploadedEvent.id}`} />}

      {/* Error-Dialog anzeigen, wenn ein Fehler auftritt */}
      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
    </div>
  );
};
