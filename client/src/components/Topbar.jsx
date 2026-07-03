export default function TopBar({ onMenuClick }) {
  return (
    <div style={{ backgroundColor: '#F0EBE3', borderBottom: '1px solid #2B2B28' }} className="px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <button
        onClick={onMenuClick}
        style={{ color: '#2B2B28' }}
        className="hover:opacity-70 transition-opacity p-1"
        aria-label="Open menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
          <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
          <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
        </svg>
      </button>
      <span style={{ color: '#2B2B28', fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 600 }} className="text-xl">
        Travesía
      </span>
    </div>
  );
}