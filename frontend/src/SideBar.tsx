import {
  Info,
  LogIn,
  LogOut,
  Plus,
  Settings,
  Smartphone,
  Upload,
  UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./SideBar.css";

export const SideBar = ({
  loggedIn,
  user,
  handleLogout,
  showUploads,
  setShowUploads,
  handleOnUpload,
  handleInstallClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="side-bar">
      <div className="menu-items">
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
          <h3>Profile</h3>
        </button>

        <button onClick={() => navigate(`/me`)} className="menu-item">
          <Settings size={20} />
          <h3>Settings</h3>
        </button>

        <button
          onClick={() => navigate("/admin/events/create")}
          className="menu-item"
        >
          <Plus size={20} />
          <p>Create Event</p>
        </button>

        <button
          onClick={() => {
            setShowUploads(!showUploads);
            handleOnUpload();
          }}
          className="menu-item"
        >
          <Upload size={20} />
          <p>{showUploads ? "Hide My Events" : "My Events"}</p>
        </button>

        <button onClick={handleInstallClick} className="menu-item">
          <Smartphone size={20} />
          <p>Install App</p>
        </button>

        <button onClick={() => navigate("/about")} className="menu-item">
          <Info size={20} />
          <p>About</p>
        </button>

        {!loggedIn ? (
          <button onClick={() => navigate("/login")} className="menu-item">
            <LogIn size={20} />
            <p>Login</p>
          </button>
        ) : (
          <button onClick={handleLogout} className="menu-item">
            <LogOut size={20} />
            <p>Logout</p>
          </button>
        )}
      </div>
    </div>
  );
};
