import { Home, Search, Send, Settings } from "lucide-react";
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
              setViewMode("Home");
              setSearchState({ view: "Home" });
            }}
          >
            <Home size={22} />
          </button>

          <button
            onClick={() => {
              setViewMode("Search");
              setSearchState({ view: "Search" });
            }}
          >
            <Search size={22} />
          </button>

          <button
            className="create-event-plus"
            onClick={() => setIsUploadOpen(true)}
          >
            +
          </button>

          <button onClick={() => navigate("/my-groups")}>
            <Send size={22} />
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
            <Settings size={22} />
          </button>
        </div>
      </nav>
    </div>
  );
};
