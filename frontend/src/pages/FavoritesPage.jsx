import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Eye, Palette, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5001/api';
const getCart = () => { try { return JSON.parse(localStorage.getItem('artisana_cart') || '[]'); } catch { return []; } };
const saveCart = (c) => { localStorage.setItem('artisana_cart', JSON.stringify(c)); window.dispatchEvent(new Event('artisana_cart_updated')); };

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(new Set());
  
  const syncCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('artisana_cart') || '[]');
      setCartItems(new Set(cart.map(i => i.id)));
    } catch { setCartItems(new Set()); }
  };
  
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserId = user ? user.id : 1;

  const fetchFavorites = () => {
    setLoading(true);
    fetch(`${API_URL}/favorites?user_id=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setFavorites(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
    syncCartItems();
    window.addEventListener('artisana_cart_updated', syncCartItems);
    return () => window.removeEventListener('artisana_cart_updated', syncCartItems);
  }, []);

  const removeFavorite = (id) => {
    fetch(`${API_URL}/favorites/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFavorites(favorites.filter(f => f.id !== id));
        }
      });
  };

  const handleAddToCart = (artwork) => {
    const cart = getCart();
    const existing = cart.find(i => i.id === artwork.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, artwork.stock || 1);
    } else {
      cart.push({ ...artwork, quantity: 1 });
    }
    saveCart(cart);
  };

  if (loading) return <div className="text-center py-20 text-muted">Favoriler yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-secondary flex items-center justify-center gap-3">
          <Heart className="text-error" fill="currentColor" /> Favorilerim
        </h1>
        <p className="text-muted">Beğendiğiniz eserleri buradan takip edebilir ve satın alabilirsiniz.</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-muted-bg/30 rounded-lg border border-dashed border-border space-y-4">
          <Heart size={48} className="mx-auto text-muted-light" />
          <p className="text-muted text-lg">Henüz favoriye eklediğiniz bir eser yok.</p>
          <Link to="/artworks" className="inline-block px-6 py-2.5 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors">
            Eserleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map(fav => {
            const artwork = fav.artwork;
            if (!artwork) return null;


            return (
              <div key={fav.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row">
                  {/* Görsel */}
                  <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted-bg flex-shrink-0 relative">
                    {artwork.image_url ? (
                      <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Palette size={32} className="text-primary-light opacity-40" /></div>
                    )}
                    {!artwork.is_available && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-error text-white px-3 py-1 rounded-sm font-bold text-xs">SATILDI</span>
                      </div>
                    )}
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{artwork.category}</span>
                          <h3 className="text-xl font-bold text-secondary mt-0.5">{artwork.title}</h3>
                          <p className="text-sm text-primary-light font-medium">{artwork.artist_name}</p>
                        </div>
                        <div className="text-xl font-bold text-secondary">{Number(artwork.price).toLocaleString('tr-TR')} ₺</div>
                      </div>
                      <p className="text-sm text-muted mt-2 line-clamp-2">{artwork.description}</p>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                      <button
                        onClick={() => handleAddToCart(artwork)}
                        disabled={!artwork.is_available}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                          cartItems.has(artwork.id)
                            ? 'bg-success text-white cursor-default'
                            : artwork.is_available
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'bg-muted-bg text-muted cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart size={16} />
                        {cartItems.has(artwork.id) ? 'Eklendi ✓' : artwork.is_available ? 'Sepete Ekle' : 'Tükendi'}
                      </button>
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-error/30 text-error rounded-sm text-sm font-medium hover:bg-error/5 transition-colors"
                      >
                        <Trash2 size={16} /> Kaldır
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
