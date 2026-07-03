import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TravelGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const placeRes = await api.get(`/places/${id}`);
        setPlace(placeRes.data);
        setGenerating(true);
        const essayRes = await api.post(`/places/${id}/essay`);
        setEssay(essayRes.data.essay);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate travel guide.');
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    }
    load();
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (loading || generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F0EBE3' }}>
        <div className="w-10 h-10 rounded-full border-4 border-charcoal/20 border-t-terracotta animate-spin" />
        <p className="text-warmgray font-medium">
          {generating ? 'Generating your travel guide...' : 'Loading place data...'}
        </p>
        <p className="text-warmgray text-sm">This may take a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#F0EBE3' }}>
        <p className="text-red-700">{error}</p>
        <button onClick={() => navigate(-1)} className="text-teal underline text-sm">Go back</button>
      </div>
    );
  }

  if (!place) return null;

  const paragraphs = essay.split('\n').filter((p) => p.trim().length > 0);

  return (
    <>
      {/* Print Controls - hidden when printing */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white border-b border-charcoal/10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-sm text-warmgray hover:text-charcoal transition-colors">
          ← Back
        </button>
        <p className="text-sm text-warmgray">Travel Guide Preview</p>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
        >
          🖨️ Save as PDF
        </button>
      </div>

      {/* Magazine Page */}
      <div className="pt-14 no-print-padding">
        <div className="max-w-2xl mx-auto px-8 py-12 print-page" style={{ backgroundColor: '#F0EBE3', minHeight: '100vh' }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-charcoal">
            <p className="logo-script text-2xl" style={{ color: '#1F2E2B' }}>Travesía</p>
            <p className="label-caps text-xs" style={{ color: '#8C8478' }}>Travel Guide</p>
          </div>

          {/* Category + Date */}
          <div className="flex items-center gap-3 mb-4">
            <span className="label-caps text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}>
              {place.category}
            </span>
            <span className="text-xs" style={{ color: '#8C8478' }}>
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-serif font-bold mb-2 leading-tight" style={{ fontSize: '2.5rem', color: '#1F2E2B' }}>
            {place.name}
          </h1>
          <p className="mb-6" style={{ color: '#8C8478', fontSize: '1.1rem' }}>
            {place.city ? `${place.city}, ` : ''}{place.country}
          </p>

          {/* Hero Image */}
          {place.images?.[0] && (
            <div className="w-full h-72 rounded-lg overflow-hidden mb-8">
              <img src={place.images[0]} alt={place.name} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-charcoal/15">
            <div className="text-center">
              <p className="font-serif font-bold text-xl" style={{ color: '#1F2E2B' }}>
                {place.averageRating?.toFixed(1) || '—'}
              </p>
              <p className="label-caps text-xs" style={{ color: '#8C8478' }}>Rating</p>
            </div>
            <div className="text-center">
              <p className="font-serif font-bold text-xl" style={{ color: '#1F2E2B' }}>
                {place.reviewCount || 0}
              </p>
              <p className="label-caps text-xs" style={{ color: '#8C8478' }}>Reviews</p>
            </div>
            <div className="text-center">
              <p className="font-serif font-bold text-xl" style={{ color: '#1F2E2B' }}>
                {place.viewCount || 0}
              </p>
              <p className="label-caps text-xs" style={{ color: '#8C8478' }}>Views</p>
            </div>
            {place.latitude && (
              <div className="text-center">
                <p className="font-serif font-bold text-sm" style={{ color: '#1F2E2B' }}>
                  {place.latitude.toFixed(3)}°, {place.longitude.toFixed(3)}°
                </p>
                <p className="label-caps text-xs" style={{ color: '#8C8478' }}>Coordinates</p>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="mb-8 leading-relaxed text-lg italic" style={{ color: '#2B2B28', fontFamily: 'Georgia, serif' }}>
            "{place.description}"
          </p>

          {/* Historical Essay */}
          <h2 className="font-serif font-bold text-xl mb-5" style={{ color: '#1F2E2B' }}>
            History & Culture
          </h2>
          <div className="space-y-4">
            {paragraphs.map((para, index) => (
              <p key={index} className="leading-relaxed" style={{ color: '#2B2B28', fontSize: '0.95rem', lineHeight: '1.8' }}>
                {para}
              </p>
            ))}
          </div>

          {/* Additional Images */}
          {place.images?.length > 1 && (
            <div className="mt-10">
              <h2 className="font-serif font-bold text-xl mb-4" style={{ color: '#1F2E2B' }}>Gallery</h2>
              <div className="grid grid-cols-2 gap-3">
                {place.images.slice(1).map((img, index) => (
                  <div key={index} className="h-40 rounded-lg overflow-hidden">
                    <img src={img} alt={`${place.name} ${index + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {place.reviews?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-serif font-bold text-xl mb-4" style={{ color: '#1F2E2B' }}>What Travelers Say</h2>
              <div className="space-y-4">
                {place.reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="pl-4 border-l-2" style={{ borderColor: '#C2613D' }}>
                    <p className="italic text-sm leading-relaxed" style={{ color: '#2B2B28' }}>"{review.comment}"</p>
                    <p className="text-xs mt-1" style={{ color: '#8C8478' }}>— {review.user?.name} · ★ {review.rating}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-charcoal flex items-center justify-between">
            <p className="logo-script text-lg" style={{ color: '#1F2E2B' }}>Travesía</p>
            <p className="text-xs" style={{ color: '#8C8478' }}>
              travesia.app · {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .no-print-padding { padding-top: 0 !important; }
          body { background: #F0EBE3; }
          .print-page { max-width: 100%; padding: 2cm; }
        }
      `}</style>
    </>
  );
}