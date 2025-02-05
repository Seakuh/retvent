import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { AddScreen, CreateEvent } from "./screens/AddScreen";
import AddEventScreen from "./screens/AddEventScreen";
import { AuthProvider } from './contexts/AuthContext';
import EventDetailPage from "./screens/EventDetailPage";
import { Toaster } from 'react-hot-toast';
import RegisterScreen from "./screens/RegisterScreen";
import LoginScreen from "./screens/LoginScreen";
import { AddEventPage } from './pages/AddEventPage';
import { AddLocationPage } from './pages/AddLocationPage';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Toaster position="top-center" />
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<HomeScreen />} />
              <Route path="/map" element={<MapScreen />} />
              <Route path="/add" element={<AddScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/create-event" element={<AddEventScreen />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/auth/login" element={<LoginScreen />} />
              <Route path="/auth/register" element={<RegisterScreen />} />
              <Route path="/events/add" element={<AddEventPage />} />
              <Route path="/locations/add" element={<AddLocationPage />} />
            </Routes>
            <BottomNavigation />
          </div>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
