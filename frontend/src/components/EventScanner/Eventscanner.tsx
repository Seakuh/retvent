// components/EventScanner.tsx
import React, { useRef, useState } from 'react';
import './Eventscanner.css';
import { uploadEventImage } from './service';

export const EventScanner: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const image = event.target.files[0];
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.info('Location from Upload:', lat, lon);
          setLocation({ lat, lon });
          await uploadEventImage(image, lat, lon);
        }, () => {
          uploadEventImage(image); // Falls der Nutzer die Location verweigert
        });
      } else {
        await uploadEventImage(image);
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
      {/* <h2>📸 Scan Event Flyer</h2> */}
      <button className="retro-button" onClick={triggerFileInput}>📤 Upload Event Flyer</button>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
    </div>
  );
};