import {
  Info,
  LogIn,
  LogOut,
  Plus,
  Search,
  Send,
  Settings,
  Smartphone,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import "./Sidebar.css";

interface SidebarProps {
  setSearchPerformed: (value: boolean) => void;
  setSearchState: (state: any) => void;
  navigate: (path: string) => void;
  setIsUploadOpen: (isOpen: boolean) => void;
  setShowUploads: (show: boolean) => void;
  showUploads: boolean;
  handleOnUpload: () => void;
  handleInstallClick: () => void;
  handleLogout: () => void;
}

export const Sidebar = ({
  setSearchPerformed,
  setSearchState,
  navigate,
  setIsUploadOpen,
  setShowUploads,
  showUploads,
  handleOnUpload,
  handleInstallClick,
  handleLogout,
}: SidebarProps) => {
  const { loggedIn, user } = useContext(UserContext);

  return (
    <aside className="side-bar">
      <div className="menu-items">
        <div className="menu-item">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-md"
            onClick={() => {
              setSearchPerformed(false);
              setSearchState({ view: "All" });
              setSearchState({ prompt: "" });
              setSearchState({ location: "Worldwide" });
              setSearchState({ startDate: "" });
              setSearchState({ endDate: "" });
              setSearchState({ category: "" });
              navigate("/");
            }}
          />
        </div>

        <button className="menu-item" onClick={() => setIsUploadOpen(true)}>
          <Search size={20} />
          <span>Search</span>
        </button>

        <button
          className="menu-item"
          onClick={() => setIsUploadOpen(!isUploadOpen)}
        >
          <Upload size={20} />
          <span>Upload</span>
        </button>

        <button className="menu-item" onClick={() => navigate("/my-groups")}>
          <Send size={20} />
          <span>My Groups</span>
        </button>

        <button
          onClick={() => {
            if (loggedIn) {
              navigate(`/profile/${user?.id}`);
            } else {
              navigate("/login");
            }
          }}
          className="menu-item"
        >
          <UserIcon size={20} />
          <span>Profile</span>
        </button>

        <button onClick={() => navigate(`/me`)} className="menu-item">
          <Settings size={20} />
          <span>Settings</span>
        </button>

        <button
          onClick={() => navigate("/admin/events/create")}
          className="menu-item"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>

        <button
          onClick={() => {
            setShowUploads(!showUploads);
            handleOnUpload();
          }}
          className="menu-item"
        >
          <Upload size={20} />
          <span>{showUploads ? "Hide My Events" : "My Events"}</span>
        </button>

        <button onClick={handleInstallClick} className="menu-item">
          <Smartphone size={20} />
          <span>Install App</span>
        </button>

        <button onClick={() => navigate("/about")} className="menu-item">
          <Info size={20} />
          <span>About</span>
        </button>

        {!loggedIn ? (
          <button onClick={() => navigate("/login")} className="menu-item">
            <LogIn size={20} />
            <span>Login</span>
          </button>
        ) : (
          <button onClick={handleLogout} className="menu-item">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};
