import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const authService = new AuthService();
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    isArtist: true // Always an artist
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await authService.register(formData);
      navigate('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed 😢');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register 📝</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? 
          <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
};

export default Register; 