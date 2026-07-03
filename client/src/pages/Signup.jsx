import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(name, email, password);
      showToast('Account created successfully!');
      navigate('/');
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 p-8 bg-white border border-charcoal/10 rounded-lg shadow-sm">
      <h1 className="text-2xl font-serif font-bold text-teal mb-5">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          required
        />
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
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4 text-sm text-warmgray">
        Already have an account? <Link to="/login" className="text-terracotta font-medium hover:underline">Login</Link>
      </p>
    </div>
  );
}