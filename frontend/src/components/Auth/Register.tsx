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
    confirmPassword: '',
    isArtist: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match! 🔐');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await authService.register(registerData);
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            required
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="isArtist"
              checked={formData.isArtist}
              onChange={(e) => setFormData({...formData, isArtist: e.target.checked})}
            />
            <label htmlFor="isArtist">Register as Artist 🎨</label>
          </div>
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