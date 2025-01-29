import React, { useRef, useState } from "react";
import "./Eventscanner.css";
import { uploadEventImage } from "./service";
import UploadedEventCard from "../UploadedEventCard/UploadedEventCard";
import ErrorDialog from "../ErrorDialog/ErrorDialog";

export const EventScanner: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedEvent, setUploadedEvent] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const image = event.target.files[0];

      setIsUploading(true); // Upload-Fortschritt starten
      setError(null); // Reset Error

      try {
        const eventResponse = await uploadEventImage(image);

        if (!eventResponse) {
          setError("Das Bild konnte nicht erkannt werden. Bitte versuche es mit einem anderen Bild.");
        } else {
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
      <button className="retro-button" onClick={triggerFileInput}>
        📤 Upload Event 
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}/>
      {/* Upload Progressbar */}
      {isUploading && (
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
      )}

      {/* Hochgeladenes Event in Fullscreen anzeigen */}
      {uploadedEvent && <UploadedEventCard event={uploadedEvent} isUploading={isUploading} onClose={() => setUploadedEvent(null)} />}
    
      {/* Error-Dialog anzeigen, wenn ein Fehler auftritt */}
      {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
    </div>
  );
};
