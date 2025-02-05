import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AddScreen from "./screens/AddScreen";
import EventDetailPage from "./screens/EventDetailPage";
import { Toaster } from 'react-hot-toast';
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <AuthProvider>
        <Router>
          <div className="App">
            <div className="content">
              <Toaster position="top-center" />
              <Routes>
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/add" element={<AddScreen />} />
                <Route path="/add-location" element={<Navigate to="/add?tab=location" />} />
                <Route path="/create-event" element={<Navigate to="/add?tab=event" />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/auth/login" element={<LoginScreen />} />
                <Route path="/auth/register" element={<RegisterScreen />} />
              </Routes>
              <BottomNavigation />
            </div>
          </div>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
