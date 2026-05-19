import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Eye, Heart, Calendar, MapPin, Clock, Star, Palette, Users, ShoppingCart, Sparkles } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const HomePage = () => {
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ artworks: [], workshops: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    setLoading(true);
    try {
      const [artRes, wsRes] = await Promise.all([
        fetch(`${API_URL}/artworks?sort=popular`),
        fetch(`${API_URL}/workshops`)
      ]);
      const artData = await artRes.json();
      const wsData = await wsRes.json();

      if (artData.success) setFeaturedArtworks(artData.data.slice(0, 6));
      if (wsData.success) setUpcomingWorkshops(wsData.data.slice(0, 4));
    } catch (err) {
      console.error('Ana sayfa verisi alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const [artRes, wsRes] = await Promise.all([
        fetch(`${API_URL}/artworks?search=${encodeURIComponent(searchQuery)}`),
        fetch(`${API_URL}/workshops?search=${encodeURIComponent(searchQuery)}`)
      ]);
      const artData = await artRes.json();
      const wsData = await wsRes.json();
      setSearchResults({
        artworks: artData.success ? artData.data : [],
        workshops: wsData.success ? wsData.data : []
      });
    } catch (err) {
      console.error('Arama hatası:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ artworks: [], workshops: [] });
  };

  const hasSearchResults = searchResults.artworks.length > 0 || searchResults.workshops.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fade-in">

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-secondary-dark to-primary-dark text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-[150px]"></div>
        </div>
        <div className="relative z-10 px-8 py-20 md:px-16 md:py-28 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-white/10">
            <Sparkles size={14} className="text-amber-400" />
            Sanatın Dijital Buluşma Noktası
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-6">
            Eşsiz Eserleri Keşfedin,<br />
            <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
              Yaratıcı Atölyelere Katılın
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mb-10 leading-relaxed">
            Artisana ile Türkiye'nin en yetenekli sanatçılarının eserlerini keşfedin, 
            atölye etkinliklerine katılın ve sanat koleksiyonunuzu oluşturmaya başlayın.
          </p>

          {/* Arama Çubuğu */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-lg">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Eser, sanatçı veya atölye ara..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/60 focus:bg-white/15 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? 'Aranıyor...' : 'Ara'}
            </button>
          </form>

          {/* İstatistikler */}
          <div className="flex gap-10 mt-12">
            <div>
              <p className="text-2xl font-bold">{featuredArtworks.length > 0 ? '100+' : '0'}</p>
              <p className="text-xs text-white/50 mt-0.5">Sanat Eseri</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingWorkshops.length > 0 ? '13+' : '0'}</p>
              <p className="text-xs text-white/50 mt-0.5">Atölye & Etkinlik</p>
            </div>
            <div>
              <p className="text-2xl font-bold">10+</p>
              <p className="text-xs text-white/50 mt-0.5">Uzman Sanatçı</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ARAMA SONUÇLARI ═══ */}
      {(hasSearchResults || (searchQuery && !isSearching)) && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
              <Search size={22} className="text-primary" />
              "{searchQuery}" için Sonuçlar
              <span className="text-sm font-normal text-muted ml-2">
                ({searchResults.artworks.length} eser, {searchResults.workshops.length} atölye)
              </span>
            </h2>
            <button onClick={clearSearch} className="text-sm text-muted hover:text-primary transition-colors">
              Aramayı Temizle ✕
            </button>
          </div>

          {!hasSearchResults && (
            <div className="text-center py-12 bg-muted-bg/50 rounded-xl border border-border">
              <p className="text-muted text-lg">Sonuç bulunamadı.</p>
              <p className="text-muted/60 text-sm mt-1">Farklı anahtar kelimeler deneyebilirsiniz.</p>
            </div>
          )}

          {/* Eser Sonuçları */}
          {searchResults.artworks.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                <Palette size={18} className="text-primary" /> Eserler ({searchResults.artworks.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.artworks.slice(0, 6).map(art => (
                  <Link to="/artworks" key={art.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                    <div className="h-44 bg-muted-bg overflow-hidden">
                      {art.image_url
                        ? <img src={art.image_url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center text-muted text-3xl">🎨</div>
                      }
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-secondary text-sm truncate">{art.title}</h4>
                      <p className="text-xs text-muted mt-1">{art.artist_name}</p>
                      <p className="text-sm font-bold text-primary mt-2">{Number(art.price).toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Atölye Sonuçları */}
          {searchResults.workshops.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-accent" /> Atölyeler ({searchResults.workshops.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.workshops.slice(0, 4).map(ws => (
                  <Link to="/workshops" key={ws.id} className="bg-surface border border-border rounded-xl p-5 flex gap-4 hover:shadow-lg transition-all group">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted-bg shrink-0">
                      {ws.image_url
                        ? <img src={ws.image_url} alt={ws.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted text-xl">🎭</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-secondary text-sm truncate">{ws.title}</h4>
                      <p className="text-xs text-muted mt-1">{ws.instructor} · {ws.category}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ws.date).toLocaleDateString('tr-TR')}</span>
                        <span className="flex items-center gap-1"><MapPin size={12} /> {ws.location?.split(',')[0]}</span>
                      </div>
                      <p className="text-sm font-bold text-primary mt-2">{Number(ws.price).toLocaleString('tr-TR')} ₺</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══ ÖNE ÇIKAN ESERLER ═══ */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-secondary flex items-center gap-3">
              <Palette className="text-primary" size={28} />
              Öne Çıkan Eserler
            </h2>
            <p className="text-muted text-sm mt-2">En çok ilgi gören ve en beğenilen sanat eserleri</p>
          </div>
          <Link to="/artworks" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArtworks.map((artwork, idx) => (
            <Link
              to="/artworks"
              key={artwork.id}
              className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative h-56 bg-muted-bg overflow-hidden">
                {artwork.image_url ? (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/20 font-serif text-4xl">🎨</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {idx === 0 && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star size={10} /> En Popüler
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-primary">
                  {artwork.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-secondary text-lg truncate group-hover:text-primary transition-colors">
                  {artwork.title}
                </h3>
                <p className="text-xs text-muted mt-1 flex items-center gap-1">
                  <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                    {artwork.artist_name?.charAt(0)}
                  </span>
                  {artwork.artist_name}
                </p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-lg font-bold text-primary">{Number(artwork.price).toLocaleString('tr-TR')} ₺</span>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1"><Eye size={13} /> {artwork.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={13} /> {artwork.favorites_count || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ YAKLAŞAN ATÖLYELER ═══ */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-secondary flex items-center gap-3">
              <Calendar className="text-accent" size={28} />
              Yaklaşan Atölyeler
            </h2>
            <p className="text-muted text-sm mt-2">En güncel atölye ve etkinlik programlarımız</p>
          </div>
          <Link to="/workshops" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingWorkshops.map((ws) => {
            const available = ws.capacity - ws.enrolled;
            const pct = ws.capacity > 0 ? Math.round((ws.enrolled / ws.capacity) * 100) : 0;
            return (
              <Link
                to="/workshops"
                key={ws.id}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-accent/30 transition-all duration-300 flex flex-col md:flex-row"
              >
                <div className="md:w-48 h-48 md:h-auto bg-muted-bg overflow-hidden shrink-0">
                  {ws.image_url ? (
                    <img
                      src={ws.image_url}
                      alt={ws.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/20 font-serif text-3xl">🎭</div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm">{ws.category}</span>
                      {available <= 3 && available > 0 && (
                        <span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded-sm animate-pulse">
                          Son {available} Kişilik!
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-secondary text-lg group-hover:text-primary transition-colors">
                      {ws.title}
                    </h3>
                    <p className="text-xs text-muted mt-1">Eğitmen: {ws.instructor}</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(ws.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {ws.start_time?.substring(0, 5)} – {ws.end_time?.substring(0, 5)}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} /> {ws.location?.split(',')[0]}</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-muted mb-1">
                        <span className="flex items-center gap-1"><Users size={11} /> {available} kişilik yer kaldı</span>
                        <span>{ws.enrolled}/{ws.capacity}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-error' : pct >= 70 ? 'bg-amber-500' : 'bg-success'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-lg font-bold text-primary">{Number(ws.price).toLocaleString('tr-TR')} ₺</span>
                      <span className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Detaylar <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ CTA BANDI ═══ */}
      <section className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-2xl p-10 text-center space-y-5">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-secondary">
          Sanat Yolculuğunuza Başlayın
        </h2>
        <p className="text-muted max-w-xl mx-auto">
          Artisana ile eşsiz sanat eserlerine sahip olun, atölye etkinliklerine katılın 
          ve yaratıcı topluluğumuzun bir parçası olun.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/artworks"
            className="inline-flex items-center gap-2 px-7 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-primary/20"
          >
            <ShoppingCart size={16} /> Eserleri Keşfet
          </Link>
          <Link
            to="/workshops"
            className="inline-flex items-center gap-2 px-7 py-3 bg-surface border-2 border-primary text-primary rounded-xl font-semibold text-sm hover:bg-primary hover:text-white transition-all"
          >
            <Calendar size={16} /> Atölyelere Göz At
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
