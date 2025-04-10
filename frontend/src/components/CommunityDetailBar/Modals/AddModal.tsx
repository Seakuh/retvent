export const AddModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="add-modal-container" onClick={onClose}>
      <div className="add-modal-content">
        <h2>Add Modal</h2>
      </div>
    </div>
  );
};
