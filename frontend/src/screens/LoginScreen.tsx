import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import { toast } from 'react-hot-toast';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/profile');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white neon-text">
            Welcome Back
          </h1>
          <p className="mt-2 text-white/80">
            Sign in to continue your journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMailOutline className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoLockClosedOutline className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full
                     shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </motion.button>

          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/auth/register')}
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Don't have an account? Sign up
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password')}
              className="block w-full text-sm text-white/60 hover:text-white transition-colors"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginScreen; 