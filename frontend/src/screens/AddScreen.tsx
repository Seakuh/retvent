import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, MapPin, PlusCircle, FilePlus } from 'lucide-react';
import './AddScreen.css';
import { EventScanner } from '../components/EventScanner/Eventscanner';

export const AddScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="add-screen">
      <div className="button-container">
        <EventScanner />
 
        <button className="action-button" onClick={() => navigate('/create-event')}>
          <PlusCircle size={24} /> Add Event
        </button>
        <button className="action-button" onClick={() => navigate('/add-location')}>
          <MapPin size={24} /> Add Event Location
        </button>
      </div>
    </div>
  );
};

// Upload Flyer Component
export const UploadFlyer: React.FC = () => {
  return (
    <div className="upload-flyer">
      <h2>Upload Flyer</h2>
      <input type="file" accept="image/*" className="file-input" />
      <button className="upload-button">Upload</button>
    </div>
  );
};

// Create Event Component
export const CreateEvent: React.FC = () => {
  return (
    <div className="create-event">
      <h2>Create Event</h2>
      <button className="create-button">Create</button>
    </div>
  );
};

// Add Location Component
export const AddLocation: React.FC = () => {
  return (
    <div className="add-location">
      <h2>Add Location</h2>
      <button className="location-button">Add</button>
    </div>
  );
};
