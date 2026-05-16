import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ArtworksPage from './pages/ArtworksPage';
import ArtworkDetailPage from './pages/ArtworkDetailPage';
import WorkshopsPage from './pages/WorkshopsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import ArtistsPage from './pages/ArtistsPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <Navbar />
        
        <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Routes>
            {/* Ortak */}
            <Route path="/" element={<HomePage />} />

            {/* ═══ Geliştirici 1: Eserler & E-Ticaret ═══ */}
            <Route path="/artworks" element={<ArtworksPage />} />
            <Route path="/artworks/:id" element={<ArtworkDetailPage />} />
            <Route path="/artists" element={<ArtistsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ═══ Geliştirici 2: Atölyeler & Destek ═══ */}
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
