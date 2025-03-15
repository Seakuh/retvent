import React from "react";
import { Link } from "react-router-dom";
import "./Admin.css";

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.username} 👋</h1>

      <div className="dashboard-grid">
        <Link to="/admin/events" className="dashboard-card">
          <h3>My Events 📅</h3>
          <p>Manage your events</p>
        </Link>
        <Link to="/admin/events/create" className="dashboard-card">
          <h3>Create Event 🎪</h3>
          <p>Add a new event</p>
        </Link>
        <Link to="/liked" className="dashboard-card">
          <h3>Liked Events 💖</h3>
          <p>View your liked events</p>
        </Link>
        <Link to="/" className="dashboard-card">
          <h3>Event-Scanner 📷 </h3>
          <p>Go to the Landing Page</p>
        </Link>
        <Link to="/" className="dashboard-card" onClick={handleLogout}>
          <h3>Logout 🔒</h3>
          <p>Logout from your account</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
