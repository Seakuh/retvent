import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { AddScreen, CreateEvent } from "./screens/AddScreen";
import AddEventScreen from "./screens/AddEventScreen";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/add" element={<AddScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/create-event" element={<AddEventScreen />} />

        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
