import React, { useState } from "react";

const ImageUpload = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  };

  return (
    <div className="image-upload-container">
      <label className="upload-label" htmlFor="image-upload">
        📷 Click to upload an image
      </label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="image-selection"
        onChange={handleFileChange}
      />
      {preview && <img src={preview} alt="Preview" className="image-preview active" />}
    </div>
  );
};

export default ImageUpload;
