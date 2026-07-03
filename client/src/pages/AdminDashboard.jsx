import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

// Simple bar chart component — no external library needed
function BarChart({ data, valueKey, labelKey, color = '#C2613D' }) {
  if (!data || data.length === 0) return <p className="text-warmgray text-sm">No data yet.</p>;
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item[labelKey]} className="flex items-center gap-3">
          <span className="text-xs text-warmgray capitalize w-24 shrink-0 truncate">{item[labelKey]}</span>
          <div className="flex-1 bg-warmgray/10 rounded-full h-5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: max > 0 ? `${(item[valueKey] / max) * 100}%` : '0%',
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs font-medium text-charcoal w-6 text-right shrink-0">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  );
}

// Simple donut chart using SVG
function DonutChart({ data, labelKey, valueKey }) {
  if (!data || data.length === 0) return <p className="text-warmgray text-sm">No data yet.</p>;

  const COLORS = ['#1F2E2B', '#C2613D', '#8C8478', '#2E423D', '#A84F30', '#E5DDD1', '#2B2B28', '#F0EBE3', '#4A6741', '#D4A96A'];
  const total = data.reduce((sum, d) => sum + d[valueKey], 0);
  let cumulative = 0;

  const radius = 60;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item, i) => {
    const pct = item[valueKey] / total;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...item, pct, offset, dash, color: COLORS[i % COLORS.length] };
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E5DDD1" strokeWidth="20" />
        {slices.map((slice, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="20"
            strokeDasharray={`${slice.dash} ${circumference - slice.dash}`}
            strokeDashoffset={slice.offset}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-xs" style={{ fontSize: '12px', fill: '#8C8478' }}>Total</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: '18px', fontWeight: 'bold', fill: '#1F2E2B' }}>{total}</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
            <span className="capitalize text-charcoal">{slice[labelKey]}</span>
            <span className="text-warmgray">({Math.round(slice.pct * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-warmgray">Loading dashboard...</p>;
  if (!stats) return <p className="text-center mt-10 text-warmgray">No data available.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-serif font-bold text-teal mb-6">Admin Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="bg-white border border-charcoal/10 rounded-lg p-6 text-center">
          <p className="text-3xl font-serif font-bold text-teal">{stats.totalPlaces}</p>
          <p className="text-warmgray text-sm mt-1">Total Places</p>
        </div>
        <div className="bg-white border border-charcoal/10 rounded-lg p-6 text-center">
          <p className="text-3xl font-serif font-bold text-teal">{stats.totalReviews}</p>
          <p className="text-warmgray text-sm mt-1">Total Reviews</p>
        </div>
        <div className="bg-white border border-charcoal/10 rounded-lg p-6 text-center">
          <p className="text-3xl font-serif font-bold text-teal">{stats.totalUsers}</p>
          <p className="text-warmgray text-sm mt-1">Total Users</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* Bar Chart — Places by Category */}
        <div className="bg-white border border-charcoal/10 rounded-lg p-6">
          <h2 className="text-lg font-serif font-bold text-teal mb-5">Places by Category</h2>
          <BarChart
            data={stats.categoryBreakdown}
            valueKey="count"
            labelKey="_id"
            color="#C2613D"
          />
        </div>

        {/* Donut Chart — Category Distribution */}
        <div className="bg-white border border-charcoal/10 rounded-lg p-6">
          <h2 className="text-lg font-serif font-bold text-teal mb-5">Category Distribution</h2>
          <DonutChart
            data={stats.categoryBreakdown}
            labelKey="_id"
            valueKey="count"
          />
        </div>
      </div>

      {/* Top Rated Bar Chart */}
      <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-serif font-bold text-teal mb-5">Top Rated Places</h2>
        <BarChart
          data={stats.topRatedPlaces.map((p) => ({ name: p.name, rating: p.averageRating || 0 }))}
          valueKey="rating"
          labelKey="name"
          color="#1F2E2B"
        />
      </div>

      {/* Most Reviewed Places List */}
      <div className="bg-white border border-charcoal/10 rounded-lg p-6">
        <h2 className="text-lg font-serif font-bold text-teal mb-4">Most Reviewed Places</h2>
        {stats.topRatedPlaces.length === 0 ? (
          <p className="text-warmgray text-sm">No reviews yet.</p>
        ) : (
          <div className="space-y-2">
            {stats.topRatedPlaces.map((place, index) => (
              <Link
                key={place._id}
                to={`/places/${place._id}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-charcoal/10 hover:border-terracotta/40 transition-colors"
              >
                <span className="text-2xl font-serif font-bold w-8 shrink-0" style={{ color: index === 0 ? '#C2613D' : index === 1 ? '#8C8478' : '#2B2B28' }}>
                  {index + 1}
                </span>
                {place.images?.[0] && (
                  <img src={place.images[0]} alt={place.name} className="h-10 w-14 object-cover rounded shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-teal truncate">{place.name}</p>
                  <p className="text-sm text-warmgray">{place.city ? `${place.city}, ` : ''}{place.country}</p>
                </div>
                <div className="text-right text-sm shrink-0">
                  <p className="font-medium" style={{ color: '#C2613D' }}>★ {place.averageRating?.toFixed(1)}</p>
                  <p className="text-warmgray">{place.reviewCount} reviews</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}