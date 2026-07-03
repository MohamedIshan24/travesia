import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back!');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-8 bg-white border border-charcoal/10 rounded-lg shadow-sm">
      <h1 className="text-2xl font-serif font-bold text-teal mb-5">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-teal text-cream w-full py-2.5 rounded font-medium hover:bg-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-warmgray">
        No account? <Link to="/signup" className="text-terracotta font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
}