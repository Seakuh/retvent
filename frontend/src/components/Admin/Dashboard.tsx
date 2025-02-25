import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
      </div>
    </div>
  );
};

export default Dashboard; 