import { Plus } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CreatePostModal } from "../components/Community/CreatePostModal";
import { UserContext } from "../contexts/UserContext";
import {
  Community,
  CommunityMember,
  CommunityPost,
  getCommunityById,
  getCommunityMembers,
  getCommunityPosts,
  joinCommunity,
  updateCommunity,
  uploadCommunityImage,
} from "../services/community.service";
import "./CommunityDetailPage.css";

export const CommunityDetailPage: React.FC = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const { user, loggedIn } = useContext(UserContext);
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "members">("posts");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const isCreator = community?.creatorId === user?.userId;
  const isMember = community?.members.includes(user?.userId || "");

  const fetchPosts = async () => {
    if (!communityId) return;
    const postsData = await getCommunityPosts(communityId);
    setPosts(postsData);
  };

  useEffect(() => {
    const fetchCommunityData = async () => {
      if (!communityId) return;

      setLoading(true);
      const communityData = await getCommunityById(communityId);
      setCommunity(communityData);

      const postsData = await getCommunityPosts(communityId);
      setPosts(postsData);

      const membersData = await getCommunityMembers(communityId);
      setMembers(membersData);

      setLoading(false);
    };

    void fetchCommunityData();
  }, [communityId]);

  const handleJoin = async () => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    if (!communityId) return;

    const success = await joinCommunity(communityId);
    if (success && community) {
      setCommunity({
        ...community,
        members: [...community.members, user?.userId || ""],
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !communityId || !isCreator) {
      return;
    }

    setIsUploadingImage(true);
    const file = e.target.files[0];
    const imageUrl = await uploadCommunityImage(file);

    if (imageUrl && community) {
      const updated = await updateCommunity(communityId, { imageUrl });
      if (updated) {
        setCommunity(updated);
      }
    }

    setIsUploadingImage(false);
  };

  if (loading) {
    return (
      <div className="community-detail-page">
        <div className="community-detail-loading">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="community-detail-page">
        <div className="community-detail-error">Community not found</div>
      </div>
    );
  }

  return (
    <div className="community-detail-page">
      <div className="community-detail-header">
        <div className="community-detail-image-container">
          {community.imageUrl ? (
            <img
              src={`https://img.event-scanner.com/insecure/rs:fill:800:400/q:80/plain/${community.imageUrl}@webp`}
              alt={community.name}
              className="community-detail-image"
            />
          ) : (
            <div className="community-detail-placeholder">
              {community.name.charAt(0).toUpperCase()}
            </div>
          )}
          {isCreator && (
            <label className="community-detail-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImage}
              />
              {isUploadingImage ? "Uploading..." : "Change Image"}
            </label>
          )}
        </div>

        <div className="community-detail-info">
          <h1 className="community-detail-name">{community.name}</h1>
          {community.description && (
            <p className="community-detail-description">
              {community.description}
            </p>
          )}
          <div className="community-detail-stats">
            <span>{community.members.length} members</span>
            <span>{posts.length} posts</span>
          </div>

          {!isMember && (
            <button className="community-detail-join-btn" onClick={handleJoin}>
              Join Community
            </button>
          )}
        </div>
      </div>

      <div className="community-detail-tabs">
        <button
          className={`community-detail-tab ${
            activeTab === "posts" ? "active" : ""
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`community-detail-tab ${
            activeTab === "members" ? "active" : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          Members
        </button>
      </div>

      <div className="community-detail-content">
        {activeTab === "posts" && (
          <div className="community-posts-container">
            {isMember && (
              <button
                className="community-create-post-btn"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus size={18} />
                Create Post
              </button>
            )}

            {posts.length === 0 ? (
              <div className="community-no-posts">No posts yet</div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="community-post">
                  <div className="community-post-header">
                    <div className="community-post-user">
                      {post.profileImageUrl && (
                        <img
                          src={post.profileImageUrl}
                          alt={post.username}
                          className="community-post-avatar"
                        />
                      )}
                      <span className="community-post-username">
                        {post.username}
                      </span>
                    </div>
                    <span className="community-post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {post.title && (
                    <h3 className="community-post-title">{post.title}</h3>
                  )}
                  {post.description && (
                    <p className="community-post-description">
                      {post.description}
                    </p>
                  )}

                  {post.images && post.images.length > 0 && (
                    <div className="community-post-images">
                      {post.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Post image ${idx + 1}`}
                          className="community-post-image"
                        />
                      ))}
                    </div>
                  )}

                  <div className="community-post-actions">
                    <span>{post.likes?.length || 0} likes</span>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="community-members-container">
            {members.map((member) => (
              <div key={member.id} className="community-member">
                {member.profileImageUrl && (
                  <img
                    src={member.profileImageUrl}
                    alt={member.username}
                    className="community-member-avatar"
                  />
                )}
                <span className="community-member-name">{member.username}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {communityId && (
        <CreatePostModal
          communityId={communityId}
          isOpen={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => void fetchPosts()}
        />
      )}
    </div>
  );
};
