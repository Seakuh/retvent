import { Compass, Home, Plus, Send, Settings } from "lucide-react";
import "./BottomBar.css";
import { User } from "./utils";

interface BottomBarProps {
  setViewMode: (view: string) => void;
  setSearchState: (state: any) => void;
  setIsUploadOpen: (isOpen: boolean) => void;
  loggedIn: boolean;
  user: User;
  navigate: (path: string) => void;
}

export const BottomBar = ({
  setViewMode,
  setSearchState,
  setIsUploadOpen,
  loggedIn,
  user,
  navigate,
}: BottomBarProps) => {
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
              setViewMode("All");
              setSearchState({ view: "All" });
            }}
          >
            <Compass size={22} />
          </button>

          <button onClick={() => setIsUploadOpen(true)}>
            <Plus size={22} />
          </button>

          <button onClick={() => navigate("/my-groups")}>
            <Send size={22} />
          </button>

          <button
            onClick={() => {
              if (loggedIn) {
                navigate(`/profile/${user?.id}`);
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
