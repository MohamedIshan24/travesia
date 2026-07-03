import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId, newRole) {
    if (userId === currentUser._id) {
      showToast('You cannot change your own role.', 'error');
      return;
    }
    setUpdatingId(userId);
    try {
      const res = await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role: res.data.role } : u));
      showToast(`User role updated to ${newRole}.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update role.', 'error');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-serif font-bold text-teal mb-5">User Management</h1>

      {loading ? (
        <p className="text-warmgray">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="text-warmgray">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user._id} className="bg-white border border-charcoal/10 rounded-lg p-4 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-teal truncate">{user.name}</p>
                  <p className="text-sm text-warmgray truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <p className="text-xs text-warmgray hidden sm:block">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>

                {user._id === currentUser._id ? (
                  <span className="label-caps text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}>
                    you
                  </span>
                ) : (
                  <select
                    value={user.role}
                    disabled={updatingId === user._id}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="border border-charcoal/15 rounded-lg px-2 py-1 text-xs bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-warmgray mt-6">Total: {users.length} user{users.length !== 1 ? 's' : ''}</p>
    </div>
  );
}