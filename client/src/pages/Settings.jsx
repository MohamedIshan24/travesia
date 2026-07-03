import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Settings() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await api.put('/auth/me', payload);
      setUser(res.data);
      showToast('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white border border-charcoal/10 rounded-lg shadow-sm">
      <h1 className="text-2xl font-serif font-bold text-teal mb-5">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-warmgray block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
            required
          />
        </div>
        <div>
          <label className="text-sm text-warmgray block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
            required
          />
        </div>

        <hr className="border-charcoal/10 my-4" />
        <p className="text-sm text-warmgray">Leave blank to keep your current password.</p>

        <div>
          <label className="text-sm text-warmgray block mb-1">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>
        <div>
          <label className="text-sm text-warmgray block mb-1">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-warmgray/40 rounded w-full p-2.5 focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-teal text-cream w-full py-2.5 rounded font-medium hover:bg-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}