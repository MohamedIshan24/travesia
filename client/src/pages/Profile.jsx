import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [reviewsRes, favoritesRes] = await Promise.all([
          api.get('/reviews/my'),
          api.get('/favorites'),
        ]);
        setStats({
          reviewCount: reviewsRes.data.length,
          favoriteCount: favoritesRes.data.length,
          reviews: reviewsRes.data,
        });
      } catch {
        showToast('Failed to load profile data.', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10 text-warmgray">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">

      {/* Profile Header */}
      <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-cream"
            style={{ backgroundColor: '#1F2E2B' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-teal">{user?.name}</h1>
            <p className="text-warmgray text-sm">{user?.email}</p>
            <span
              className="label-caps text-xs mt-1 inline-block px-2 py-0.5 rounded"
              style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-charcoal/10 rounded-lg p-5 text-center">
          <p className="text-3xl font-serif font-bold text-teal">{stats?.reviewCount}</p>
          <p className="text-warmgray text-sm mt-1">Reviews Written</p>
        </div>
        <div className="bg-white border border-charcoal/10 rounded-lg p-5 text-center">
          <p className="text-3xl font-serif font-bold text-teal">{stats?.favoriteCount}</p>
          <p className="text-warmgray text-sm mt-1">Places Saved</p>
        </div>
      </div>

      {/* Recent Reviews */}
      <h2 className="text-xl font-serif font-bold text-teal mb-3">My Reviews</h2>
      {stats?.reviews.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-warmgray font-medium">No reviews yet.</p>
            <p className="text-warmgray text-sm mt-1">Visit a place and share your experience.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.reviews.map((review) => (
            <div key={review._id} className="bg-white border border-charcoal/10 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-teal">{review.place?.name || 'Unknown place'}</p>
                <span className="flex items-center gap-1 text-sm">
                  <span style={{ color: '#C2613D' }}>★</span>
                  {review.rating}
                </span>
              </div>
              <p className="text-charcoal mt-2 text-sm">{review.comment}</p>
              <p className="text-xs text-warmgray mt-1">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}