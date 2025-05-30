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
  setSearchPerformed,
  setSearchState,
  setIsSearchOpen,
  isSearchOpen,
  isUploadOpen,
  setIsUploadOpen,
}) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Desktop Sidebar - nur auf md und größer sichtbar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 backdrop-blur-[30px] bg-[color:var(--color-neon-blue-dark)/80] border-r-[1px] border-r-[color:var(--color-neon-blue-light)]">
        <div className="p-4">
          <div className="flex items-center gap-3 cursor-pointer mb-8">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-md ml-3"
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

          <nav className="space-y-2">
            <button
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
              <span>Search</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              onClick={() => setIsUploadOpen(!isUploadOpen)}
            >
              <Upload size={20} />
              <span>Upload</span>
            </button>

            <button
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              onClick={() => navigate("/my-groups")}
            >
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
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <UserIcon size={20} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                navigate(`/me`);
              }}
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                navigate("/admin/events/create");
              }}
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <Plus size={20} />
              <span>Create Event</span>
            </button>

            <button
              onClick={() => {
                setShowUploads(!showUploads);
                handleOnUpload();
              }}
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <Upload size={20} />
              <span>{showUploads ? "Hide My Events" : "My Events"}</span>
            </button>

            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <Smartphone size={20} />
              <span>Install App</span>
            </button>

            <button
              onClick={() => {
                navigate("/about");
              }}
              className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
            >
              <Info size={20} />
              <span>About</span>
            </button>

            {!loggedIn ? (
              <button
                onClick={() => {
                  navigate("/login");
                }}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <LogIn size={20} />
                <span>Login</span>
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white w-full hover:bg-white/10 rounded-lg"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            )}
          </nav>
        </div>
      </aside>
    </div>
  );
};
