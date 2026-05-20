import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Scale } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import { useToast } from '../hooks/useToast';

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastUI } = useToast();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5001/api/artworks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArtwork(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!artwork || artwork.error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-primary">Eser Bulunamadı</h2>
        <button onClick={() => navigate('/artworks')} className="mt-4 text-primary underline">
          Eserlere Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/artworks')}
        className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span>Eserlere Dön</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Görsel Alanı */}
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-amber-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title} 
            className="relative w-full h-[600px] object-cover rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Detay Alanı */}
        <div className="flex flex-col justify-center">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 w-max">
            {artwork.category.name}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
            {artwork.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <img src={artwork.artist.imageUrl} alt={artwork.artist.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
            <div>
              <p className="text-sm text-foreground/60">Sanatçı</p>
              <p className="font-medium text-lg">{artwork.artist.name}</p>
            </div>
          </div>

          <p className="text-foreground/80 text-lg leading-relaxed mb-8">
            {artwork.description}
          </p>

          <div className="text-4xl font-light text-primary mb-10">
            ₺{artwork.price.toLocaleString('tr-TR')}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate(`/checkout/${id}`)}
              className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <ShoppingBag size={20} />
              <span className="font-medium text-lg">Hemen Satın Al</span>
            </button>
            <button className="p-4 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center hover:bg-secondary/80 transition-all shadow-md hover:-translate-y-1">
              <Heart size={24} />
            </button>
          </div>

          {/* Madde 11: Karşılaştırma Altyapısı */}
          <div className="mt-8 pt-8 border-t border-border">
            <button
              onClick={() => {
                const item = {
                  id: artwork.id,
                  title: artwork.title,
                  imageUrl: artwork.imageUrl,
                  price: artwork.price,
                  category: artwork.category.name,
                  artist_name: artwork.artist.name,
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
                } catch (e) { console.error(e); }
              }}
              className="w-full py-3 border-2 border-dashed border-primary/50 text-primary rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors group"
            >
              <Scale size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Karşılaştırmaya Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <CommentsSection targetType="artwork" targetId={id} />
      {ToastUI}
    </div>
  );
};

export default ArtworkDetailPage;
