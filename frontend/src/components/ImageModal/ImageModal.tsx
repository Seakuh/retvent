interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  onClose,
}) => (
  <div className="image-modal" onClick={onClose}>
    <button className="close-modal">✕</button>
    <img
      src={imageUrl}
      alt="Full size"
      className="modal-image"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);
