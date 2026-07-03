import { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
      style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}