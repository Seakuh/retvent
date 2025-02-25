import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminEvents from './components/Admin/AdminEvents';
import CreateEvent from './components/Admin/CreateEvent';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AdminPage } from './components/AdminPage/AdminPage';
import { EventDetail } from './components/EventDetail/EventDetail';

const App: React.FC = () => {
  return (
    <div className="app">
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:eventid" element={<EventDetail />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
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
        </Routes>
      </main>
    </div>
  );
};

export default App;
