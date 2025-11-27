import { Plus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { Community, getAllCommunities } from "../../services/community.service";
import { CommunityCard } from "./CommunityCard";
import { CreateCommunityModal } from "./CreateCommunityModal";
import "./CommunityList.css";

export const CommunityList: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { loggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  const fetchCommunities = async () => {
    setLoading(true);
    const data = await getAllCommunities();
    setCommunities(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchCommunities();
  }, []);

  if (loading) {
    return (
      <div className="community-list-container">
        <h2 className="community-list-title">Communities</h2>
        <div className="community-list-loading">Loading...</div>
      </div>
    );
  }

  if (communities.length === 0) {
    return null;
  }

  const handleCreateClick = () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }
    setShowCreateModal(true);
  };

  return (
    <div className="community-list-container">
      <div className="community-list-header">
        <h2 className="community-list-title">Communities</h2>
        <button className="community-create-btn" onClick={handleCreateClick}>
          <Plus size={18} />
          Create
        </button>
      </div>
      <div className="community-list-grid">
        {communities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => void fetchCommunities()}
      />
    </div>
  );
};
