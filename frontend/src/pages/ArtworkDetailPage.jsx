import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Scale } from 'lucide-react';

const ArtworkDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/artworks/${id}`)
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
            <button className="flex-1 bg-primary text-primary-foreground py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <ShoppingBag size={20} />
              <span className="font-medium text-lg">Sepete Ekle</span>
            </button>
            <button className="p-4 bg-secondary text-secondary-foreground rounded-xl flex items-center justify-center hover:bg-secondary/80 transition-all shadow-md hover:-translate-y-1">
              <Heart size={24} />
            </button>
          </div>

          {/* Madde 11: Karşılaştırma Altyapısı */}
          <div className="mt-8 pt-8 border-t border-border">
            <button className="w-full py-3 border-2 border-dashed border-primary/50 text-primary rounded-xl flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors group">
              <Scale size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Karşılaştırmaya Ekle (Madde 11)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Yorumlar Bölümü */}
      <ArtworkComments artworkId={id} />
    </div>
  );
};

const ArtworkComments = ({ artworkId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const fetchComments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments?target_type=artwork&target_id=${artworkId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (err) {
      console.error('Yorumlar yüklenirken hata:', err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [artworkId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Yorum yapmak için giriş yapmalısınız.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          target_type: 'artwork',
          target_id: artworkId,
          content: newComment,
          rating: rating
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Yorum eklenemedi.');
      }

      setNewComment('');
      setRating(5);
      fetchComments(); // Yorumları yenile
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-serif text-primary mb-6">Yorumlar ({comments.length})</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 bg-surface/50 p-6 rounded-xl border border-white/5">
          <h3 className="text-lg font-medium mb-4">Yorum Yap</h3>
          {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block text-sm text-foreground/70 mb-2">Puan (1-5)</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary"
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} Yıldız</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Eser hakkında ne düşünüyorsunuz?"
              className="w-full px-4 py-3 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary min-h-[100px]"
              required
            />
          </div>
          <button type="submit" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 font-medium">
            Gönder
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <p className="text-foreground/80">Yorum yapabilmek için <a href="/login" className="text-primary hover:underline font-medium">giriş yapmalısınız</a>.</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="p-4 bg-surface rounded-xl border border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-primary">{c.user?.name || `Kullanıcı #${c.user_id}`}</span>
              <span className="text-amber-500 font-medium">{c.rating} ⭐</span>
            </div>
            <p className="text-foreground/80 whitespace-pre-wrap">{c.content}</p>
            <div className="mt-2 text-xs text-foreground/50">
              {new Date(c.created_at || c.createdAt).toLocaleDateString('tr-TR')}
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-foreground/50 italic text-center py-8">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
        )}
      </div>
    </div>
  );
};

export default ArtworkDetailPage;
