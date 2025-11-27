import { X } from "lucide-react";
import { useState } from "react";
import { createCommunity } from "../../services/community.service";
import "./CreateCommunityModal.css";

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setLoading(true);
    const result = await createCommunity({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
    });

    if (result) {
      setName("");
      setDescription("");
      setIsPublic(true);
      onSuccess();
      onClose();
    }

    setLoading(false);
  };

  return (
    <div className="create-community-modal-overlay" onClick={onClose}>
      <div
        className="create-community-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="create-community-modal-header">
          <h2>Create Community</h2>
          <button className="create-community-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-community-form">
          <div className="create-community-field">
            <label htmlFor="name">Community Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DJs, Equipment, Artists..."
              maxLength={50}
              required
            />
          </div>

          <div className="create-community-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is your community about?"
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="create-community-field-checkbox">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <label htmlFor="isPublic">Public community</label>
          </div>

          <button
            type="submit"
            className="create-community-submit"
            disabled={loading || !name.trim()}
          >
            {loading ? "Creating..." : "Create Community"}
          </button>
        </form>
      </div>
    </div>
  );
};
