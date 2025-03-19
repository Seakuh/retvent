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
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    let file: File | null = null;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.kind === "file" && item.type.startsWith("image/")) {
        file = item.getAsFile();
        break;
      } else if (item.kind === "string" && item.type === "text/uri-list") {
        item.getAsString(async (url) => {
          try {
            const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
            const response = await fetch(proxyUrl, {
              headers: {
                Origin: window.location.origin,
              },
            });

            const blob = await response.blob();
            file = new File([blob], "image.jpg", { type: "image/jpeg" });
            await processFile(file);
          } catch (err) {
            setError(
              "Could not process the dropped image URL. Please try downloading and uploading the image directly."
            );
          }
        });
        return;
      }
    }

    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setProgress(25);
    setError(null);

    let isUploading = true;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95 || !isUploading) {
          setIsProcessing(true);
          return prev;
        }
        return Math.min(prev + (Math.floor(Math.random() * 4) + 5), 95);
      });
    }, 300);

    try {
      const eventResponse = await uploadEventImage(file);
      if (!eventResponse) {
        setError("Could not recognize the image. Please try another one.");
      } else {
        isUploading = false;
        clearInterval(interval);
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
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      await processFile(event.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`event-scanner-container ${isDragging ? "dragging" : ""}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
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

        {isDragging && (
          <div className="drag-overlay">
            <div className="drag-content">
              <div className="drag-emoji">📸</div>
              <div className="drag-text">Drop your event image here</div>
            </div>
          </div>
        )}

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
