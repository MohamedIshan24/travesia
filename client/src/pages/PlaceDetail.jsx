import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addFavorite, removeFavorite } from '../services/favoriteService';

export default function PlaceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [place, setPlace] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([fetchPlace(), fetchReviews(), checkFavorite()]);
    } catch {
      showToast('Failed to load this place.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    setActiveImage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchPlace() {
    const res = await api.get(`/places/${id}`);
    setPlace(res.data);
    setRelated(res.data.related || []);
  }

  async function fetchReviews() {
    const res = await api.get(`/reviews/place/${id}`);
    setReviews(res.data);
  }

  async function checkFavorite() {
    if (!user) return;
    try {
      const res = await api.get('/favorites');
      setIsFavorite(res.data.some((p) => p._id === id));
    } catch {
      // not critical
    }
  }

  async function toggleFavorite() {
    if (!user) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
        showToast('Removed from favorites.');
      } else {
        await addFavorite(id);
        setIsFavorite(true);
        showToast('Added to favorites.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update favorites.', 'error');
    } finally {
      setFavLoading(false);
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingReviewId) {
        await api.put(`/reviews/${editingReviewId}`, { rating, comment });
        showToast('Review updated.');
      } else {
        await api.post(`/reviews/place/${id}`, { rating, comment });
        showToast('Review submitted.');
      }
      setComment('');
      setRating(5);
      setEditingReviewId(null);
      await Promise.all([fetchPlace(), fetchReviews()]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(review) {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
  }

  function handleCancelEdit() {
    setEditingReviewId(null);
    setRating(5);
    setComment('');
  }

  async function handleDelete(reviewId) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      showToast('Review deleted.');
      await Promise.all([fetchPlace(), fetchReviews()]);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete review.', 'error');
    }
  }

  function handleGetDirections() {
    if (!place?.latitude || !place?.longitude) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: userLat, longitude: userLng } = pos.coords;
          window.open(
            `https://www.google.com/maps/dir/${userLat},${userLng}/${place.latitude},${place.longitude}`,
            '_blank'
          );
        },
        () => {
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
            '_blank'
          );
        }
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
        '_blank'
      );
    }
  }

  if (loading) return <p className="text-center mt-10 text-warmgray">Loading...</p>;
  if (!place) return <p className="text-center mt-10 text-warmgray">Place not found.</p>;

  const images = place.images || [];
  const hasLocation = place.latitude && place.longitude;

  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.country)}`;

  const streetViewUrl = hasLocation
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${place.latitude},${place.longitude}`
    : null;

  const osmEmbedUrl = hasLocation
    ? (() => {
        const minLng = place.longitude - 0.02;
        const minLat = place.latitude - 0.02;
        const maxLng = place.longitude + 0.02;
        const maxLat = place.latitude + 0.02;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${place.latitude}%2C${place.longitude}`;
      })()
    : null;

  const hotelsUrl = hasLocation
    ? `https://www.google.com/maps/search/hotels/@${place.latitude},${place.longitude},14z`
    : null;

  const restaurantsUrl = hasLocation
    ? `https://www.google.com/maps/search/restaurants/@${place.latitude},${place.longitude},14z`
    : null;

  return (
    <div className="max-w-3xl mx-auto p-6">

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mb-6">
          <div className="w-full h-64 rounded-lg overflow-hidden bg-warmgray/10">
            <img src={images[activeImage]} alt={place.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-2">
              {images.map((img, index) => (
                <button key={index} onClick={() => setActiveImage(index)} className={`h-16 w-24 rounded overflow-hidden border-2 transition-all ${activeImage === index ? 'border-terracotta' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt={`${place.name} ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Place Info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-teal">{place.name}</h1>
          <p className="text-warmgray mt-1">{place.city ? `${place.city}, ` : ''}{place.country}</p>
          <p className="label-caps text-terracotta mt-1">{place.category}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('Link copied to clipboard!');
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors"
          >
            🔗 Share
          </button>
          <Link
            to={`/places/${id}/guide`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors"
          >
            📖 Travel Guide
          </Link>
          {user && (
            <button onClick={toggleFavorite} disabled={favLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50" style={isFavorite ? { backgroundColor: '#C2613D', color: '#F0EBE3', borderColor: '#C2613D' } : { backgroundColor: 'white', color: '#2B2B28', borderColor: 'rgba(43,43,40,0.15)' }}>
              <span>{isFavorite ? '★' : '☆'}</span>
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-charcoal leading-relaxed">{place.description}</p>
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 font-medium">
          <span style={{ color: '#C2613D' }}>★</span>
          <span>{place.averageRating?.toFixed(1) || 'No ratings'}</span>
          <span className="text-warmgray">({place.reviewCount || 0} reviews)</span>
        </div>
        <span className="text-warmgray text-sm">·</span>
        <span className="text-warmgray text-sm">👁️ {place.viewCount || 0} views</span>
      </div>

      <hr className="my-8 border-charcoal/10" />

      {/* Location Section */}
      <div className="mb-8">
        <h2 className="text-xl font-serif font-bold text-teal mb-4">Location</h2>
        {osmEmbedUrl ? (
          <div>
            <div className="w-full h-64 rounded-lg overflow-hidden border border-charcoal/10 mb-3">
              <iframe title={`Map of ${place.name}`} src={osmEmbedUrl} width="100%" height="100%" style={{ border: 'none' }} loading="lazy" />
            </div>
            <p className="text-xs text-warmgray mb-3">
              📍 {place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors">
                🗺️ Open in Google Maps
              </a>
              <button onClick={handleGetDirections} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}>
                🧭 Get Directions
              </button>
              {streetViewUrl && (
                <a href={streetViewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors">
                  👁️ Street View
                </a>
              )}
              {hotelsUrl && (
                <a href={hotelsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors">
                  🏨 Nearby Hotels
                </a>
              )}
              {restaurantsUrl && (
                <a href={restaurantsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal/15 bg-white text-charcoal hover:border-terracotta/50 transition-colors">
                  🍽️ Nearby Restaurants
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-charcoal/10 rounded-lg p-5">
            <p className="text-warmgray text-sm mb-3">No exact coordinates saved for this place. Search on Google Maps instead:</p>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}>
              🗺️ Search on Google Maps
            </a>
          </div>
        )}
      </div>

      <hr className="my-8 border-charcoal/10" />

      {/* Reviews */}
      <h2 className="text-xl font-serif font-bold text-teal mb-4">Reviews</h2>
      {reviews.length === 0 && <p className="text-warmgray">No reviews yet. Be the first!</p>}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border border-charcoal/10 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-teal">{review.user?.name || 'User'}</span>
              <span className="flex items-center gap-1 text-sm">
                <span style={{ color: '#C2613D' }}>★</span>{review.rating}
              </span>
            </div>
            <p className="text-charcoal mt-2">{review.comment}</p>
            <p className="text-xs text-warmgray mt-1">
              {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {user && (review.user?._id === user._id || user.role === 'admin') && (
              <div className="mt-3 flex gap-3 text-sm">
                {review.user?._id === user._id && (
                  <button onClick={() => handleEdit(review)} className="text-teal hover:text-terracotta font-medium transition-colors">Edit</button>
                )}
                <button onClick={() => handleDelete(review._id)} className="text-red-700 hover:text-red-900 font-medium transition-colors">Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmitReview} className="mt-8 border-t border-charcoal/10 pt-6">
          <h3 className="font-serif font-semibold text-teal mb-3">
            {editingReviewId ? 'Edit your review' : 'Leave a review'}
          </h3>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border border-warmgray/40 rounded px-3 py-1.5 mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta">
            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} stars</option>
            ))}
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write your review..." className="border border-warmgray/40 rounded w-full p-3 mb-3 bg-white focus:outline-none focus:ring-2 focus:ring-terracotta" rows={4} required />
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="font-medium px-5 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}>
              {submitting ? 'Saving...' : editingReviewId ? 'Update Review' : 'Submit Review'}
            </button>
            {editingReviewId && (
              <button type="button" onClick={handleCancelEdit} className="text-warmgray hover:text-charcoal font-medium px-3 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="mt-8 text-warmgray">Log in to leave a review.</p>
      )}

      {/* Related Places */}
      {related.length > 0 && (
        <div className="mt-12">
          <hr className="mb-8 border-charcoal/10" />
          <h2 className="text-xl font-serif font-bold text-teal mb-4">
            More {place.category.charAt(0).toUpperCase() + place.category.slice(1)} Places
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r._id} to={`/places/${r._id}`} className="bg-white border border-charcoal/10 rounded-lg overflow-hidden hover:shadow-lg hover:border-terracotta/40 transition-all">
                <div className="h-32 bg-warmgray/10 overflow-hidden">
                  {r.images?.[0] ? (
                    <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warmgray text-sm">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-semibold text-teal text-sm">{r.name}</h3>
                  <p className="text-warmgray text-xs mt-1">{r.city ? `${r.city}, ` : ''}{r.country}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs">
                    <span style={{ color: '#C2613D' }}>★</span>
                    <span className="font-medium text-charcoal">{r.averageRating?.toFixed(1) || 'No ratings'}</span>
                    <span className="text-warmgray">({r.reviewCount || 0})</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}