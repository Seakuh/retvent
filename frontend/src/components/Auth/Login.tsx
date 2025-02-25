import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth.service';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const authService = new AuthService();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    isArtist: false
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed 😢');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login 🔑</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="isArtist"
              checked={formData.isArtist}
              onChange={(e) => setFormData({...formData, isArtist: e.target.checked})}
            />
            <label htmlFor="isArtist">Login as Artist 🎨</label>
          </div>
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account? 
          <span onClick={() => navigate('/register')}>Register here</span>
        </p>
      </div>
    </div>
  );
};

export default Login; 