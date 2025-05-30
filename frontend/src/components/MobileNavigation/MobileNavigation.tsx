import {
  Compass,
  Home,
  MessageCircle,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import "./MobileNavigation.css";

interface MobileNavigationProps {
  setViewMode: (view: string) => void;
  setSearchState: (state: any) => void;
  setIsUploadOpen: (isOpen: boolean) => void;
}

export const MobileNavigation = ({
  setViewMode,
  setSearchState,
  setIsUploadOpen,
}: MobileNavigationProps) => {
  const navigate = useNavigate();
  const { loggedIn, user } = useContext(UserContext);

  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-content">
        <button
          onClick={() => {
            setViewMode("Home");
            setSearchState({ view: "Home" });
          }}
          className="nav-icon-button"
        >
          <Home size={22} />
        </button>

        <button
          onClick={() => {
            setViewMode("All");
            setSearchState({ view: "All" });
          }}
          className="nav-icon-button"
        >
          <Compass size={22} />
        </button>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="nav-icon-button"
        >
          <Plus size={22} />
        </button>

        <button
          onClick={() => navigate("/my-groups")}
          className="nav-icon-button"
        >
          <MessageCircle size={22} />
        </button>

        <button
          onClick={() => {
            if (loggedIn) {
              navigate(`/profile/${user?.id}`);
            } else {
              navigate("/login");
            }
          }}
          className="nav-icon-button"
        >
          <UserIcon size={22} />
        </button>
      </div>
    </nav>
  );
};
