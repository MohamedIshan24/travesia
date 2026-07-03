import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  return (
    <div className="bg-cream border-b border-charcoal/10 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        className="text-charcoal hover:opacity-70 transition-opacity p-1"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
        </svg>
      </button>
      <Link to="/" className="logo-script text-2xl" style={{ color: '#1F2E2B' }}>
        Travesía
      </Link>
      <div className="w-8" />
    </div>
  );
}