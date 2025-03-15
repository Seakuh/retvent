import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <button onClick={handleBack} className="back-button">
        ← Event Scanner
      </button>
      <h1>Welcome back, {user.username} ✨</h1>

      <div className="dashboard-grid">
        <Link to="/admin/events" className="dashboard-card">
          <span className="emoji">🎪</span>
          <h3>My Events</h3>
          <p>Manage your event portfolio</p>
        </Link>

        <Link to="/admin/events/create" className="dashboard-card">
          <span className="emoji">✨</span>
          <h3>Create Event</h3>
          <p>Host your next amazing event</p>
        </Link>

        <Link to="/liked" className="dashboard-card">
          <span className="emoji">❤️</span>
          <h3>Favorites</h3>
          <p>View your starred events</p>
        </Link>

        <Link to="/" className="dashboard-card" onClick={handleLogout}>
          <span className="emoji">👋</span>
          <h3>Sign Out</h3>
          <p>See you next time!</p>
        </Link>
        <Link to="/" className="dashboard-card homepage-card">
          <span className="emoji">🎯</span>
          <h3>Discover Events</h3>
          <p>Explore amazing events on our homepage</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
