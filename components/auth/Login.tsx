
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../common/Card';
import Loader from '../common/Loader';

interface LoginProps {
  onToggleView: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
        const success = login(email, password);
        if (!success) {
            setLoading(false);
        }
    }, 500);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-center text-white mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-gray-400">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {loading ? <Loader size={5}/> : 'Log In'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button onClick={onToggleView} className="font-medium text-purple-400 hover:text-purple-300">
          Sign up
        </button>
      </p>
    </Card>
  );
};

export default Login;
