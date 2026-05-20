import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, Search, Eye, ShoppingCart, Palette, X, CheckCircle, Scale } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import { useToast } from '../hooks/useToast';

const API_URL = 'http://localhost:5001/api';

const CAMPAIGN_ARTWORKS = {
  2: { discount: 20, tag: 'Günün Fırsatı' },
  5: { discount: 15, tag: 'Haftalık Kampanya' },
  8: { discount: 25, tag: 'Sanatçı Özel' }
};

const getCart = () => { try { return JSON.parse(localStorage.getItem('galerist_cart') || '[]'); } catch { return []; } };
const saveCart = (c) => { localStorage.setItem('galerist_cart', JSON.stringify(c)); window.dispatchEvent(new Event('galerist_cart_updated')); };

const ArtworksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || searchParams.get('artist') || '';
  const { showToast, ToastUI } = useToast();
  
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [cartItems, setCartItems] = useState(new Set());
  const [lightboxImage, setLightboxImage] = useState(null);

  const syncCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('galerist_cart') || '[]');
      setCartItems(new Set(cart.map(i => i.id)));
    } catch { setCartItems(new Set()); }
  };

  const handleViewArtworkDetail = (artwork) => {
    setSelectedArtwork(artwork);
    fetch(`${API_URL}/artworks/${artwork.id}`).catch(err => console.error(err));
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentUserId = user ? user.id : 1;

  // Eserleri çek
  const fetchArtworks = () => {
    setLoading(true);
    const params = new URLSearchParams();
    
    // URL'deki artist parametresi varsa ve arama boşsa doğrudan artist'i de yolla
    const urlArtist = searchParams.get('artist');
    if (urlArtist && !search) {
      params.append('artist', urlArtist);
    } else if (search) {
      params.append('search', search);
    }
    
    if (selectedCategory) params.append('category', selectedCategory);
    if (sortBy) params.append('sort', sortBy);

    fetch(`${API_URL}/artworks?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setArtworks(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Kategorileri çek + sepet senkronizasyonu
  useEffect(() => {
    fetch(`${API_URL}/artworks/categories`)
      .then(res => res.json())
      .then(data => { if (data.success) setCategories(data.data); });
    syncCartItems();
    window.addEventListener('galerist_cart_updated', syncCartItems);
    return () => window.removeEventListener('galerist_cart_updated', syncCartItems);
  }, []);

  // Favorileri çek
  useEffect(() => {
    fetch(`${API_URL}/favorites?user_id=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const favSet = new Set(data.data.map(f => f.artwork_id));
          setFavorites(favSet);
        }
      });
  }, []);

  useEffect(() => {
    const querySearch = searchParams.get('search') || searchParams.get('artist') || '';
    setSearch(querySearch);
  }, [searchParams]);

  useEffect(() => {
    fetchArtworks();
  }, [selectedCategory, sortBy, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArtworks();
  };

  const toggleFavorite = (artworkId, e) => {
    e.stopPropagation();
    fetch(`${API_URL}/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUserId, artwork_id: artworkId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFavorites(prev => {
            const next = new Set(prev);
            if (data.action === 'added') next.add(artworkId);
            else next.delete(artworkId);
            return next;
          });
        }
      });
  };

  const handleAddToCart = (artwork) => {
    const cart = getCart();
    const existing = cart.find(i => i.id === artwork.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + 1, artwork.stock);
    } else {
      cart.push({ ...artwork, quantity: 1 });
    }
    saveCart(cart);
  };

  const handleAddToCompare = (artwork, e) => {
    if (e) e.stopPropagation();
    const item = {
      id: artwork.id,
      title: artwork.title,
      imageUrl: artwork.image_url || artwork.imageUrl,
      price: artwork.price,
      category: artwork.category,
      artist_name: artwork.artist_name,
      technique: artwork.technique,
      dimensions: artwork.dimensions,
      year: artwork.year
    };
    try {
      const stored = localStorage.getItem('galerist_compare');
      let compareList = stored ? JSON.parse(stored) : [];
      if (compareList.length > 0 && compareList[0].type !== 'artwork') {
        compareList = [];
      }
      if (compareList.some(i => i.id === item.id)) {
        showToast('Bu eser zaten karşılaştırma listesinde.', 'info');
        return;
      }
      if (compareList.length >= 3) {
        showToast('En fazla 3 eseri karşılaştırabilirsiniz.', 'error');
        return;
      }
      compareList.push({ ...item, type: 'artwork' });
      localStorage.setItem('galerist_compare', JSON.stringify(compareList));
      window.dispatchEvent(new Event('galerist-compare-updated'));
      showToast('Eser karşılaştırma listesine eklendi!', 'success');
    } catch (err) { console.error(err); }
  };

  if (loading && artworks.length === 0) {
    return <div className="text-center py-20 text-muted">Eserler yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Başlık */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-secondary">Sanat Eserleri</h1>
        <p className="text-muted max-w-2xl mx-auto">Türkiye'nin en yetenekli sanatçılarının eserlerini keşfedin. Orijinal eserler, sınırlı baskılar ve daha fazlası.</p>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-surface border border-border rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Arama */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Eser adı, sanatçı veya açıklama ara..."
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background text-sm"
              />
            </div>
            <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors text-sm font-medium">
              Ara
            </button>
          </form>

          {/* Kategori Filtresi */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-sm bg-background text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            {/* Sıralama */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-border rounded-sm bg-background text-sm focus:outline-none focus:border-primary"
            >
              <option value="newest">En Yeni</option>
              <option value="price_asc">Fiyat: Düşükten</option>
              <option value="price_desc">Fiyat: Yüksekten</option>
              <option value="oldest">En Eski</option>
            </select>
          </div>
        </div>
      </div>

      {/* Eser Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {artworks.map(artwork => {
          const isFav = favorites.has(artwork.id);
          return (
            <div key={artwork.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
              {/* Görsel */}
              <div className="relative h-64 bg-muted-bg overflow-hidden">
                {artwork.image_url ? (
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.title} 
                    onClick={() => setLightboxImage({ url: artwork.image_url, title: artwork.title, artist: artwork.artist_name })}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in" 
                    title="Görseli büyütmek için tıklayın"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-light font-serif text-2xl opacity-40"><Palette size={48} /></div>
                )}
                {/* Favori Butonu */}
                <button
                  onClick={(e) => toggleFavorite(artwork.id, e)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${isFav ? 'bg-error text-white' : 'bg-white/90 text-foreground/60 hover:text-error'}`}
                >
                  <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                {/* Kategori Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-primary pointer-events-none">
                  {artwork.category}
                </div>
                {/* Kampanya Badge */}
                {CAMPAIGN_ARTWORKS[artwork.id] && (
                  <div className="absolute top-12 left-3 bg-amber-500 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse z-10 pointer-events-none">
                    🔥 {CAMPAIGN_ARTWORKS[artwork.id].tag}
                  </div>
                )}
                {/* Stok Durumu */}
                {!artwork.is_available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="bg-error text-white px-4 py-2 rounded-sm font-bold text-sm">SATILDI</span>
                  </div>
                )}
              </div>

              {/* Bilgiler */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-secondary leading-tight line-clamp-1">{artwork.title}</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">{artwork.artist_name}</p>
                </div>
                <p className="text-xs text-muted line-clamp-2">{artwork.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {artwork.technique && <span className="bg-muted-bg px-2 py-0.5 rounded">{artwork.technique.split(',')[0]}</span>}
                  {artwork.year && <span>{artwork.year}</span>}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div>
                    {CAMPAIGN_ARTWORKS[artwork.id] ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted line-through">
                          {Math.round(Number(artwork.price) * (1 + CAMPAIGN_ARTWORKS[artwork.id].discount / 100)).toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-base font-bold text-amber-500">
                          {Number(artwork.price).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-secondary">{Number(artwork.price).toLocaleString('tr-TR')} ₺</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleViewArtworkDetail(artwork)}
                      className="p-2 bg-muted-bg text-muted rounded-sm hover:bg-border transition-all"
                      title="Detay"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCompare(artwork, e)}
                      className="p-2 bg-muted-bg text-muted rounded-sm hover:bg-border hover:text-primary transition-all"
                      title="Karşılaştır"
                    >
                      <Scale size={15} />
                    </button>
                    <button
                      onClick={() => artwork.is_available && handleAddToCart(artwork)}
                      disabled={!artwork.is_available}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-sm transition-all text-sm font-medium ${
                        cartItems.has(artwork.id)
                          ? 'bg-success text-white cursor-default'
                          : artwork.is_available
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-muted-bg text-muted cursor-not-allowed'
                      }`}
                    >
                      {cartItems.has(artwork.id)
                        ? <><CheckCircle size={14}/> Eklendi</>
                        : <><ShoppingCart size={14}/> Sepete Ekle</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {artworks.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted bg-muted-bg/30 rounded-lg border border-dashed border-border">
            Aradığınız kriterlere uygun eser bulunamadı.
          </div>
        )}
      </div>

      {/* Detay & Satın Alma Modalı */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 md:pt-24 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto animate-scale-in relative">
            {/* Modal Kapatma Butonu - Artık sağ üst köşede tüm modala ait */}
            <button
              onClick={() => { setSelectedArtwork(null); setCartNotify(''); }}
              className="absolute top-4 right-4 w-10 h-10 bg-surface/80 backdrop-blur border border-border shadow-md rounded-full flex items-center justify-center hover:bg-surface hover:scale-105 transition-all z-10 text-foreground"
            >
              <X size={20} />
            </button>

            {/* Modal İçerik */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Sol: Görsel */}
              <div className="relative h-72 md:h-auto bg-muted-bg">
                {selectedArtwork.image_url ? (
                  <img src={selectedArtwork.image_url} alt={selectedArtwork.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Palette size={64} className="text-primary-light opacity-30" /></div>
                )}
              </div>

              {/* Sağ: Bilgiler */}
              <div className="p-6 md:p-8 space-y-5">
                <div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{selectedArtwork.category}</span>
                  <h2 className="text-2xl font-serif font-bold text-secondary mt-1">{selectedArtwork.title}</h2>
                </div>

                {/* Sanatçı */}
                <div className="bg-muted-bg/50 p-4 rounded-lg border border-border">
                  <h4 className="font-bold text-sm text-foreground mb-1">Sanatçı: {selectedArtwork.artist_name}</h4>
                  <p className="text-xs text-muted leading-relaxed">{selectedArtwork.artist_bio}</p>
                </div>

                {/* Açıklama */}
                <p className="text-sm text-foreground/80 leading-relaxed">{selectedArtwork.description}</p>

                {/* Detaylar */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedArtwork.technique && (
                    <div><span className="text-muted block text-xs">Teknik</span><span className="font-medium">{selectedArtwork.technique}</span></div>
                  )}
                  {selectedArtwork.dimensions && (
                    <div><span className="text-muted block text-xs">Boyut</span><span className="font-medium">{selectedArtwork.dimensions}</span></div>
                  )}
                  {selectedArtwork.year && (
                    <div><span className="text-muted block text-xs">Yıl</span><span className="font-medium">{selectedArtwork.year}</span></div>
                  )}
                  <div><span className="text-muted block text-xs">Stok</span><span className="font-medium">{selectedArtwork.stock} adet</span></div>
                </div>

                {/* Fiyat ve Satın Al */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    {CAMPAIGN_ARTWORKS[selectedArtwork.id] ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-muted line-through">
                          {Math.round(Number(selectedArtwork.price) * (1 + CAMPAIGN_ARTWORKS[selectedArtwork.id].discount / 100)).toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                          {Number(selectedArtwork.price).toLocaleString('tr-TR')} ₺
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-bold font-sans">
                            {CAMPAIGN_ARTWORKS[selectedArtwork.id].tag}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-secondary">{Number(selectedArtwork.price).toLocaleString('tr-TR')} ₺</span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-sm ${selectedArtwork.is_available ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {selectedArtwork.is_available ? 'Satışta' : 'Tükendi'}
                    </span>
                  </div>

                  {cartItems.has(selectedArtwork.id) && (
                    <div className="text-success text-sm bg-success/10 p-3 rounded-sm border border-success/20 flex items-center gap-2">
                      <CheckCircle size={16}/> Ürün sepetinizde bulunuyor!
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleFavorite(selectedArtwork.id, { stopPropagation: () => {} })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-medium transition-colors border ${favorites.has(selectedArtwork.id) ? 'border-error text-error bg-error/5' : 'border-border text-foreground/70 hover:border-primary hover:text-primary'}`}
                    >
                      <Heart size={18} fill={favorites.has(selectedArtwork.id) ? 'currentColor' : 'none'} />
                      {favorites.has(selectedArtwork.id) ? 'Favoride' : 'Favoriye Ekle'}
                    </button>
                    <button
                      onClick={(e) => handleAddToCompare(selectedArtwork, e)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-medium transition-colors border border-border text-foreground/70 hover:border-primary hover:text-primary"
                    >
                      <Scale size={18} />
                      Karşılaştır
                    </button>
                    <button
                      onClick={() => selectedArtwork.is_available && handleAddToCart(selectedArtwork)}
                      disabled={!selectedArtwork.is_available}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-sm font-medium transition-colors ${
                        cartItems.has(selectedArtwork.id)
                          ? 'bg-success text-white cursor-default'
                          : selectedArtwork.is_available
                          ? 'bg-primary text-white hover:bg-primary-dark'
                          : 'bg-muted-bg text-muted cursor-not-allowed'
                      }`}
                    >
                      {cartItems.has(selectedArtwork.id)
                        ? <><CheckCircle size={18}/> Sepete Eklendi</>
                        : <><ShoppingCart size={18}/> Sepete Ekle</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Yorumlar */}
            <div className="p-6 md:p-8 border-t border-border">
              <CommentsSection targetType="artwork" targetId={selectedArtwork.id} />
            </div>
          </div>
        </div>
      )}
      {ToastUI}

      {/* Görsel Büyütme Lightbox Modalı */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          {/* Kapat Butonu */}
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-50"
            title="Kapat"
          >
            <X size={24} />
          </button>
          
          {/* Görsel Çerçevesi */}
          <div 
            className="max-w-4xl max-h-[85vh] relative overflow-hidden rounded-lg shadow-2xl flex flex-col bg-black/50"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={lightboxImage.url} 
              alt={lightboxImage.title} 
              className="max-w-full max-h-[75vh] object-contain rounded-t-lg mx-auto" 
            />
            {/* Alt Bilgi Bandı */}
            <div className="bg-black/60 backdrop-blur-sm p-4 text-white border-t border-white/10 w-full text-center">
              <h4 className="font-serif text-lg font-bold tracking-wide">{lightboxImage.title}</h4>
              <p className="text-xs text-white/60 mt-0.5">{lightboxImage.artist}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtworksPage;
