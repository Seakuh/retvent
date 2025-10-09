import { Film, Home, Plus, Search, UserIcon } from "lucide-react";
import "./BottomBar.css";
import { useLandingSearch } from "./LandinSearchContext";
import { User } from "./utils";

interface BottomBarProps {
  setViewMode: (view: string) => void;
  setIsUploadOpen: (isOpen: boolean) => void;
  loggedIn: boolean;
  user: User;
  navigate: (path: string) => void;
}

export const BottomBar = ({
  setViewMode,
  setIsUploadOpen,
  loggedIn,
  user,
  navigate,
}: BottomBarProps) => {
  const { setSearchState } = useLandingSearch();

  return (
    <div className="bottom-bar">
      <nav>
        <div>
          <button
            onClick={() => {
              setViewMode("All");
              setSearchState({ view: "All" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Home size={22} />
          </button>
          <button onClick={() => navigate("/reel")}>
            <Film size={22} />
          </button>
          <button
            className="create-event-plus"
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus size={22} />
          </button>

          <button
            onClick={() => {
              setViewMode("Search");
              setSearchState({ view: "Search" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Search size={22} />
          </button>

          <button
            onClick={() => {
              if (loggedIn) {
                navigate(`/me`);
              } else {
                navigate("/login");
              }
            }}
          >
            <UserIcon size={22} />
          </button>
        </div>
      </nav>
    </div>
  );
};
