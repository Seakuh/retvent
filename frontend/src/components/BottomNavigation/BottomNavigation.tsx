// BottomNavigation.tsx
import { Link } from "react-router-dom";
import { Home, Map, User, List } from "lucide-react";
import "./BottomNavigation.css";

const BottomNavigation = () => {
  return (
    <nav className="bottom-nav">
      <Link to="/home" className="nav-item"><Home size={24} />Home</Link>
      <Link to="/map" className="nav-item"><Map size={24} />Map</Link>
      <Link to="/my" className="nav-item"><List size={24} />My</Link>
      <Link to="/profile" className="nav-item"><User size={24} />Profile</Link>
    </nav>
  );
};

export default BottomNavigation;
