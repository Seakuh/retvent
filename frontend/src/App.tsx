import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import AdminEvents from "./components/Admin/AdminEvents";
import CreateEvent from "./components/Admin/CreateEvent";
import Dashboard from "./components/Admin/Dashboard";
import EditEvent from "./components/Admin/EditEvent";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Register from "./components/Auth/Register";
import { EventDetail } from "./components/EventDetail/EventDetail";
import { LikedEvents } from "./components/LikedEvents/LikedEvents";
import { UserContextProvider } from "./contexts/UserContextProvider";
import { eventService } from "./services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global Defaults
      staleTime: 2 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Prefetching wichtiger Daten beim App-Start
queryClient.prefetchQuery(["events", null], () => eventService.getEvents());

const App: React.FC = () => {
  return (
    <UserContextProvider>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/event/:eventId" element={<EventDetail />} />
            <Route path="/liked" element={<LikedEvents />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/create"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/edit/:eventId"
              element={
                <ProtectedRoute>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
      </div>
    </UserContextProvider>
  );
};

export default App;
