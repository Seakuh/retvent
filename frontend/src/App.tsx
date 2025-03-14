import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Admin/Dashboard';
import AdminEvents from './components/Admin/AdminEvents';
import CreateEvent from './components/Admin/CreateEvent';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { EventDetail } from './components/EventDetail/EventDetail';
import EditEvent from './components/Admin/EditEvent';
import { UserContextProvider } from './UserContext/UserContextProvider';

const App: React.FC = () => {
  return (
    <div className="app">
      <UserContextProvider>
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute>
              <AdminEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/create" element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="/admin/events/edit/:eventId" element={
            <ProtectedRoute>
              <EditEvent />
            </ProtectedRoute>
          } />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      </UserContextProvider>
    </div>
  );
};

export default App;
