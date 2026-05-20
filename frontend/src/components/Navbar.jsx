import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Palette, CalendarDays, Search, Heart, Package, MessageSquare, Settings, Headset, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const readCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('galerist_cart') || '[]');
      setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    } catch { setCartCount(0); }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check initial user
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    readCartCount();

    // Listen for storage events (login/logout)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('galerist_cart_updated', readCartCount);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('galerist_cart_updated', readCartCount);
    };
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsLoggingOut(false);
      window.dispatchEvent(new Event("storage"));
      navigate('/login');
    }, 3000);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Eserler', path: '/artworks', icon: <Palette size={15} /> },
    { name: 'Atölyeler', path: '/workshops', icon: <CalendarDays size={15} /> },
    { name: 'Sanatçılar', path: '/artists' },
  ];
  
  if (user?.role !== 'ADMIN') {
    navLinks.push({ name: 'İletişim', path: '/contact' });
  }

  if (user?.role === 'ADMIN') {
    navLinks.push({ name: 'Admin Paneli', path: '/admin' });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`bg-surface/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'border-border shadow-sm' : 'border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center group-hover:bg-primary-dark transition-colors">
              <span className="text-white font-serif text-lg font-bold">G</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-foreground leading-none">Galerist</span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted font-medium">Gallery & Studio</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                  isActive(link.path) 
                    ? 'text-primary bg-primary/5' 
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side — Icons & Auth */}
          <div className="hidden lg:flex items-center space-x-2">
            <button className="p-2.5 text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-sm transition-all">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Link to="/favorites" className="p-2.5 text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-sm transition-all">
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/cart" className="p-2.5 text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-sm transition-all relative">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            <div className="h-8 w-px bg-border mx-2"></div>
            
            {user ? (
              <div className="relative group">
                <Link to="/profile" className="flex items-center gap-1.5 px-3 py-2 text-foreground/80 hover:text-primary rounded-sm transition-all font-medium">
                  <User size={20} strokeWidth={1.5} className="text-primary" />
                  <span className="text-sm font-semibold hover:text-primary transition-colors">Hesabım</span>
                </Link>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-64 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-primary/5">
                      <span className="block text-sm font-semibold text-primary truncate">{user.email}</span>
                    </div>
                    
                    <div className="flex flex-col py-2">
                      <Link to="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Package size={18} className="text-primary" />
                        <span>Tüm Siparişlerim</span>
                      </Link>
                      
                      <Link to="/profile?tab=reservations" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors">
                        <CalendarDays size={18} className="text-foreground/60 group-hover/link:text-primary" />
                        <span>Etkinlikler</span>
                      </Link>

                      <Link to="/profile?tab=reviews" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors">
                        <MessageSquare size={18} className="text-foreground/60 group-hover/link:text-primary" />
                        <span>Değerlendirmelerim</span>
                      </Link>

                      <Link to="/profile?tab=profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors">
                        <Settings size={18} className="text-foreground/60 group-hover/link:text-primary" />
                        <span>Kullanıcı Bilgilerim</span>
                      </Link>

                      <button 
                        onClick={() => window.dispatchEvent(new Event('open-galerist-assistant'))}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors"
                      >
                        <Headset size={18} className="text-foreground/60 group-hover/link:text-primary" />
                        <span>Galerist Asistan</span>
                      </button>
                    </div>

                    <div className="border-t border-border py-1">
                      <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-50"
                      >
                        <LogOut size={18} className="text-foreground/60" />
                        <span>{isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-primary px-3 py-2 rounded-sm transition-all">
                  Giriş Yap
                </Link>
                <Link to="/register" className="text-sm font-medium bg-primary text-white px-5 py-2.5 rounded-sm hover:bg-primary-dark transition-all">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-foreground hover:text-primary p-2 rounded-sm"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'max-h-[500px] border-t border-border' : 'max-h-0'
      }`}>
        <div className="bg-surface px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-3 rounded-sm text-base font-medium transition-all ${
                isActive(link.path) ? 'bg-primary/5 text-primary' : 'text-foreground/70 hover:bg-muted-bg hover:text-primary'
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
            <div className="flex gap-2">
              <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-foreground/70 hover:text-primary border border-border rounded-sm">
                <Heart size={18} /> Favoriler
              </Link>
              <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-foreground/70 hover:text-primary border border-border rounded-sm">
                <ShoppingCart size={18} /> Sepet
              </Link>
            </div>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-sm font-medium hover:bg-primary/5 transition-all">
                  <User size={18} /> Profilim
                </Link>
                <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-center text-red-500 border border-red-500 py-2.5 rounded-sm font-medium hover:bg-red-50 transition-all disabled:opacity-50">
                  {isLoggingOut ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center border border-border py-2.5 rounded-sm font-medium hover:border-primary transition-all">
                  Giriş Yap
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-primary text-white py-2.5 rounded-sm font-medium hover:bg-primary-dark transition-all">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
