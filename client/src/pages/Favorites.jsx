import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavorites, removeFavorite } from '../services/favoriteService';
import { useToast } from '../context/ToastContext';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  async function fetchFavorites() {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch {
      showToast('Failed to load favorites.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function handleRemove(placeId) {
    try {
      await removeFavorite(placeId);
      setFavorites((prev) => prev.filter((p) => p._id !== placeId));
      showToast('Removed from favorites.');
    } catch {
      showToast('Failed to remove favorite.', 'error');
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-serif font-bold text-teal mb-6">My Favorites</h1>

      {loading ? (
        <p className="text-warmgray">Loading...</p>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🌍</p>
          <p className="text-warmgray font-medium text-lg">No saved places yet.</p>
          <p className="text-warmgray text-sm mt-1">
            Explore places and hit <span className="text-terracotta">☆ Save</span> to build your list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {favorites.map((place) => (
            <div key={place._id} className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
              <Link to={`/places/${place._id}`}>
                <div className="h-40 bg-warmgray/10 overflow-hidden">
                  {place.images?.[0] ? (
                    <img
                      src={place.images[0]}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warmgray text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-serif font-semibold text-teal">{place.name}</h2>
                  <p className="text-warmgray text-sm mt-1">
                    {place.city ? `${place.city}, ` : ''}{place.country}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(place._id)}
                className="w-full text-sm text-red-700 hover:text-red-900 font-medium py-2 border-t border-charcoal/10 transition-colors"
              >
                Remove from favorites
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}