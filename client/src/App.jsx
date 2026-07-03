import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PlaceDetail from './pages/PlaceDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminPlaces from './pages/AdminPlaces';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import BackToTop from './components/BackToTop';
import TravelGuide from './pages/TravelGuide';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Topbar onMenuClick={() => setSidebarOpen(true)} />
              <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/places/:id" element={<PlaceDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                  <Route path="/admin/places" element={<ProtectedRoute adminOnly><AdminPlaces /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                  <Route path="/places/:id/guide" element={<TravelGuide />} />
                </Routes>
              </main>

              <Footer />
              <BackToTop />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;