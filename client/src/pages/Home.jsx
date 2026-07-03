import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'beach', label: 'Beach' },
  { value: 'historical', label: 'Historical' },
  { value: 'nature', label: 'Nature' },
  { value: 'city', label: 'City' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'cafe', label: 'Cafes' },
  { value: 'shopping', label: 'Shopping' },
];

const PLACES_PER_PAGE = 6;

function SkeletonCard() {
  return (
    <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden animate-pulse">
      <div className="h-40 bg-warmgray/20" />
      <div className="p-5 space-y-2">
        <div className="h-4 bg-warmgray/20 rounded w-3/4" />
        <div className="h-3 bg-warmgray/20 rounded w-1/2" />
        <div className="h-3 bg-warmgray/20 rounded w-1/4 mt-3" />
      </div>
    </div>
  );
}

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allPlaces, setAllPlaces] = useState([]);
  const searchRef = useRef(null);
  const { showToast } = useToast();

  async function fetchPlaces(query = search) {
    setLoading(true);
    try {
      const params = {};
      if (query) params.search = query;
      if (category) params.category = category;
      const res = await api.get('/places', { params });
      setPlaces(res.data);
      setPage(1);
    } catch {
      showToast('Failed to load places.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllPlaces() {
    try {
      const res = await api.get('/places');
      setAllPlaces(res.data);
    } catch {
      // not critical
    }
  }

  useEffect(() => {
    fetchPlaces();
    fetchAllPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearchInput(e) {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = allPlaces.filter((p) =>
      p.name.toLowerCase().includes(value.toLowerCase()) ||
      p.country.toLowerCase().includes(value.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(value.toLowerCase()))
    ).slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }

  function handleSuggestionClick(place) {
    setSearch(place.name);
    setShowSuggestions(false);
    fetchPlaces(place.name);
  }

  function handleSearch(e) {
    e.preventDefault();
    setShowSuggestions(false);
    fetchPlaces(search);
  }

  function handleCategoryChange(value) {
    setCategory(value);
    setSearch('');
    setSuggestions([]);
    setShowSuggestions(false);
  }

  const sortedPlaces = [...places].sort((a, b) => {
    if (sortBy === 'top_rated') return (b.averageRating || 0) - (a.averageRating || 0);
    if (sortBy === 'most_reviewed') return (b.reviewCount || 0) - (a.reviewCount || 0);
    if (sortBy === 'name_az') return a.name.localeCompare(b.name);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sortedPlaces.length / PLACES_PER_PAGE);
  const paginatedPlaces = sortedPlaces.slice(
    (page - 1) * PLACES_PER_PAGE,
    page * PLACES_PER_PAGE
  );

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"
          alt="Travel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(31,46,43,0.5)' }} />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="label-caps mb-3" style={{ color: '#C2613D' }}>Issue No. 04 — Explore the World</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3" style={{ color: '#F0EBE3' }}>
            Discover Amazing Places
          </h1>
          <p className="text-lg max-w-xl" style={{ color: 'rgba(240,235,227,0.9)' }}>
            Explore destinations from around the world and share your experiences
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-lg p-3 flex gap-2 border border-charcoal/10">
          <div className="flex-1 relative" ref={searchRef}>
            <input
              type="text"
              value={search}
              onChange={handleSearchInput}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Search by name, country, or city..."
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal/10 rounded-lg shadow-lg overflow-hidden z-30">
                {suggestions.map((place) => (
                  <button
                    key={place._id}
                    type="button"
                    onClick={() => handleSuggestionClick(place)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream text-left transition-colors"
                  >
                    {place.images?.[0] && (
                      <img src={place.images[0]} alt={place.name} className="w-8 h-8 rounded object-cover shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-charcoal">{place.name}</p>
                      <p className="text-xs text-warmgray">{place.city ? `${place.city}, ` : ''}{place.country}</p>
                    </div>
                    <span className="ml-auto label-caps text-xs" style={{ color: '#C2613D' }}>{place.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="font-medium px-6 py-2 rounded-lg transition-colors shrink-0"
            style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
          >
            Search
          </button>
        </form>
      </div>

      <div className="max-w-5xl mx-auto p-6 pt-10">

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => handleCategoryChange(c.value)}
              className="px-4 py-1.5 rounded-full text-sm transition-colors border"
              style={
                category === c.value
                  ? { backgroundColor: '#C2613D', color: '#F0EBE3', borderColor: '#C2613D' }
                  : { backgroundColor: 'white', color: '#2B2B28', borderColor: 'rgba(43,43,40,0.15)' }
              }
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Count + Sort */}
        <div className="flex justify-between items-center mb-5">
          <p className="text-warmgray">
            {loading ? 'Loading...' : `${sortedPlaces.length} place${sortedPlaces.length !== 1 ? 's' : ''} found`}
          </p>
          {!loading && sortedPlaces.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-charcoal/15 rounded-lg px-3 py-1.5 text-sm bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-terracotta"
            >
              <option value="newest">Newest</option>
              <option value="top_rated">Top Rated</option>
              <option value="most_reviewed">Most Reviewed</option>
              <option value="name_az">Name A–Z</option>
            </select>
          )}
        </div>

        {/* Skeleton or Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sortedPlaces.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-warmgray font-medium">No places found.</p>
            <p className="text-warmgray text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {paginatedPlaces.map((place) => (
                <Link
                  key={place._id}
                  to={`/places/${place._id}`}
                  className="bg-white border border-charcoal/10 rounded-lg overflow-hidden hover:shadow-lg hover:border-terracotta/40 transition-all"
                >
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
                    <p className="label-caps text-terracotta mt-1">{place.category}</p>
                    <div className="mt-3 pt-3 border-t border-charcoal/10 flex items-center gap-1 text-sm">
                      <span style={{ color: '#C2613D' }}>★</span>
                      <span className="font-medium text-charcoal">
                        {place.averageRating?.toFixed(1) || 'No ratings'}
                      </span>
                      <span className="text-warmgray">({place.reviewCount || 0})</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-charcoal/15 text-sm font-medium text-charcoal hover:border-terracotta/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-9 h-9 rounded-lg text-sm font-medium border transition-colors"
                    style={
                      page === p
                        ? { backgroundColor: '#1F2E2B', color: '#F0EBE3', borderColor: '#1F2E2B' }
                        : { backgroundColor: 'white', color: '#2B2B28', borderColor: 'rgba(43,43,40,0.15)' }
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-charcoal/15 text-sm font-medium text-charcoal hover:border-terracotta/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}