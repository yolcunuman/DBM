import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';

const ArtworksPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArtist, setSelectedArtist] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    // Fetch initial data
    Promise.all([
      fetch('http://localhost:5000/api/categories').then(res => res.json()),
      fetch('http://localhost:5000/api/artists').then(res => res.json())
    ]).then(([cats, arts]) => {
      setCategories(cats);
      setArtists(arts);
    });
  }, []);

  useEffect(() => {
    // Fetch artworks with filters
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append('categoryId', selectedCategory);
    if (selectedArtist) params.append('artistId', selectedArtist);
    if (priceRange.min) params.append('minPrice', priceRange.min);
    if (priceRange.max) params.append('maxPrice', priceRange.max);

    fetch(`http://localhost:5000/api/artworks?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setArtworks(data);
        setLoading(false);
      });
  }, [selectedCategory, selectedArtist, priceRange]);

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-screen">
      {/* Sidebar / Filters */}
      <aside className="w-full md:w-72 shrink-0 space-y-8">
        <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border sticky top-8">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <SlidersHorizontal size={20} />
            <h2 className="text-xl font-serif font-medium">Filtreler</h2>
          </div>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Kategori</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Artist Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Sanatçı</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedArtist}
                  onChange={(e) => setSelectedArtist(e.target.value)}
                >
                  <option value="">Tüm Sanatçılar</option>
                  {artists.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Fiyat Aralığı (₺)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <span className="text-foreground/50 self-center">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Artworks Grid */}
      <main className="flex-1">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif text-primary mb-2">Eserler</h1>
            <p className="text-foreground/60">Özenle seçilmiş benzersiz sanat eserlerini keşfedin.</p>
          </div>
          <div className="text-sm text-foreground/50">
            {artworks.length} eser bulundu
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-muted-bg rounded-2xl h-[400px]"></div>
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border">
            <Search className="mx-auto text-foreground/30 mb-4" size={48} />
            <h3 className="text-xl font-medium mb-2">Eser Bulunamadı</h3>
            <p className="text-foreground/60">Seçtiğiniz filtrelere uygun eser bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork) => (
              <Link to={`/artworks/${artwork.id}`} key={artwork.id} className="group flex flex-col bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border">
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {artwork.category.name}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-medium mb-1 group-hover:text-primary transition-colors line-clamp-1">{artwork.title}</h3>
                  <p className="text-sm text-foreground/60 mb-4">{artwork.artist.name}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-medium text-primary">₺{artwork.price.toLocaleString('tr-TR')}</span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      İncele →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtworksPage;
