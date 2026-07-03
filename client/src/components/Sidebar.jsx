import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
      isActive(path)
        ? 'font-medium'
        : 'text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5'
    }`;

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/30 z-30" />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-60 flex flex-col z-40 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#F0EBE3', borderRight: '1px solid rgba(43,43,40,0.1)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-5 py-5" style={{ borderBottom: '1px solid rgba(43,43,40,0.1)' }}>
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <img src={logo} alt="Travesía" className="h-9 w-auto" />
            <span className="logo-script text-lg" style={{ color: '#1F2E2B' }}>Travesía</span>
          </Link>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <Link to="/" onClick={onClose} className={linkClass('/')}
            style={isActive('/') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
            Home
          </Link>

          {user?.role === 'admin' && (
            <>
              <Link to="/admin/dashboard" onClick={onClose} className={linkClass('/admin/dashboard')}
                style={isActive('/admin/dashboard') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
                Dashboard
              </Link>
              <Link to="/admin/places" onClick={onClose} className={linkClass('/admin/places')}
                style={isActive('/admin/places') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
                Manage Places
              </Link>
              <Link to="/admin/users" onClick={onClose} className={linkClass('/admin/users')}
                style={isActive('/admin/users') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
                Users
              </Link>
            </>
          )}

          {user && (
            <>
              <Link to="/favorites" onClick={onClose} className={linkClass('/favorites')}
                style={isActive('/favorites') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
                Favorites
              </Link>
              <Link to="/profile" onClick={onClose} className={linkClass('/profile')}
                style={isActive('/profile') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
                Profile
              </Link>
            </>
          )}

          {user && (
            <Link to="/settings" onClick={onClose} className={linkClass('/settings')}
              style={isActive('/settings') ? { backgroundColor: '#C2613D', color: '#F0EBE3' } : {}}>
              Settings
            </Link>
          )}
        </nav>

        {/* Bottom User Section */}
        <div className="px-3 py-5" style={{ borderTop: '1px solid rgba(43,43,40,0.1)' }}>
          {user ? (
            <div className="space-y-2">
              <div className="px-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#1F2E2B', color: '#F0EBE3' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{user.name}</p>
                  <p className="text-xs text-warmgray truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full font-medium px-4 py-2 rounded-lg transition-colors text-sm mt-2"
                style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2 px-1">
              <Link
                to="/login"
                onClick={onClose}
                className="block text-center text-sm font-medium py-2 rounded-lg transition-colors"
                style={{ color: '#1F2E2B', border: '1px solid rgba(43,43,40,0.15)' }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={onClose}
                className="block text-center font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                style={{ backgroundColor: '#C2613D', color: '#F0EBE3' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}