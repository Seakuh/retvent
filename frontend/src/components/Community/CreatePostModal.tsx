import { Image, X } from "lucide-react";
import { useState } from "react";
import { createCommunityPost } from "../../services/community.service";
import "./CreatePostModal.css";

interface CreatePostModalProps {
  communityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  communityId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !description.trim() && images.length === 0) return;

    setLoading(true);
    const result = await createCommunityPost(
      communityId,
      title.trim() || undefined,
      description.trim() || undefined,
      images.length > 0 ? images : undefined
    );

    if (result) {
      setTitle("");
      setDescription("");
      setImages([]);
      setPreviews([]);
      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="create-post-modal-overlay" onClick={onClose}>
      <div className="create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-post-modal-header">
          <h2>Create Post</h2>
          <button className="create-post-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="create-post-field">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              maxLength={100}
            />
          </div>

          <div className="create-post-field">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              maxLength={2000}
            />
          </div>

          {previews.length > 0 && (
            <div className="create-post-previews">
              {previews.map((preview, index) => (
                <div key={index} className="create-post-preview">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="create-post-preview-remove"
                    onClick={() => removeImage(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="create-post-actions">
            <label className="create-post-image-btn">
              <Image size={20} />
              Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>

            <button
              type="submit"
              className="create-post-submit"
              disabled={
                loading ||
                (!title.trim() && !description.trim() && images.length === 0)
              }
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
