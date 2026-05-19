import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, MessageSquare, ArrowRight, User } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const ArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/artworks/artists`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setArtists(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching artists:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-stone-900 via-neutral-900 to-stone-800 border border-white/10 p-8 md:p-12 text-center space-y-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(163,145,119,0.1),transparent_40%)]" />
        <div className="relative max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Artisana Yaratıcıları
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight leading-tight">
            Değerli Sanatçılarımız
          </h1>
          <p className="text-foreground/70 text-sm md:text-base leading-relaxed">
            Eserleriyle ruhumuza dokunan, geleneksel teknikleri modern estetikle buluşturan ve Artisana topluluğuna hayat veren sanatçılarımızın hikayelerini keşfedin.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : artists.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 space-y-4">
          <Palette size={48} className="mx-auto text-muted" />
          <h3 className="font-bold text-lg text-foreground">Henüz Sanatçı Kaydı Bulunmuyor</h3>
          <p className="text-sm text-foreground/60">Sistemde kayıtlı eser sahibi sanatçılar listelenecektir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-primary/30 transition-all duration-300 flex flex-col h-full"
            >
              {/* Cover Image Placeholder or Artist's Artwork */}
              <div className="relative h-40 w-full overflow-hidden bg-stone-900 border-b border-white/5">
                {artist.image_url ? (
                  <img 
                    src={artist.image_url} 
                    alt={artist.artist_name} 
                    className="w-full h-full object-cover filter brightness-75 group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-primary/10 to-stone-800 flex items-center justify-center">
                    <Palette size={40} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col space-y-4 relative -mt-10">
                {/* Profile Badge */}
                <div className="flex items-end space-x-3">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-primary to-primary-dark border-2 border-background flex items-center justify-center text-white font-serif text-2xl font-bold shadow-xl flex-shrink-0">
                    {artist.artist_name.charAt(0)}
                  </div>
                  <div className="pb-1">
                    <h3 className="font-serif font-bold text-xl text-foreground leading-tight">
                      {artist.artist_name}
                    </h3>
                    <span className="text-xs text-primary font-medium">Bağımsız Sanatçı</span>
                  </div>
                </div>

                {/* Biography */}
                <p className="text-sm text-foreground/75 leading-relaxed flex-1 line-clamp-4">
                  {artist.artist_bio}
                </p>

                {/* Action Button */}
                <div className="pt-2 border-t border-white/10">
                  <Link 
                    to={`/artworks?artist=${encodeURIComponent(artist.artist_name)}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-semibold text-foreground/80 border border-white/10 hover:border-primary transition-all duration-300 group-hover:translate-y-0"
                  >
                    Eserlerini Keşfet
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistsPage;
