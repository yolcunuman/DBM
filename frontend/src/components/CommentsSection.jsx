import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, ShieldCheck, User } from 'lucide-react';

const CommentsSection = ({ targetType, targetId }) => {
  const [comments, setComments] = useState([]);
  const [meta, setMeta] = useState({ avg_rating: null, total_count: 0 });
  const [loading, setLoading] = useState(true);
  
  // Yeni yorum formu state
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitStatus, setSubmitStatus] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [votedComments, setVotedComments] = useState([]);
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const savedVotes = localStorage.getItem('votedComments');
    if (savedVotes) setVotedComments(JSON.parse(savedVotes));
  }, []);

  const fetchComments = () => {
    setLoading(true);
    fetch(`http://localhost:5001/api/comments?target_type=${targetType}&target_id=${targetId}&sort=${sortBy}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setComments(data.data);
          setMeta(data.meta);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Comments fetch error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComments();
  }, [targetType, targetId, sortBy]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
      setSubmitStatus('error');
      return;
    }
    
    setSubmitStatus('loading');
    setSubmitError('');
    
    const commentData = {
      target_type: targetType,
      target_id: targetId,
      content: newComment,
      rating: rating
    };

    fetch('http://localhost:5001/api/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(commentData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubmitStatus('success');
          setNewComment('');
          setRating(5);
          fetchComments();
          setTimeout(() => setSubmitStatus(''), 3000);
        } else {
          setSubmitStatus('error');
          setSubmitError(data.message || 'Bir hata oluştu.');
        }
      })
      .catch(() => {
        setSubmitStatus('error');
        setSubmitError('Sunucuya bağlanılamadı.');
      });
  };

  const handleHelpful = (commentId) => {
    if (!token) return alert('Oy vermek için giriş yapmalısınız.');
    
    const hasVoted = votedComments.includes(commentId);
    const action = hasVoted ? 'decrement' : 'increment';

    fetch(`http://localhost:5001/api/comments/${commentId}/helpful`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let newVotes;
          if (hasVoted) {
            newVotes = votedComments.filter(id => id !== commentId);
          } else {
            newVotes = [...votedComments, commentId];
          }
          setVotedComments(newVotes);
          localStorage.setItem('votedComments', JSON.stringify(newVotes));

          setComments(comments.map(c => 
            c.id === commentId ? { ...c, helpful_count: data.data.helpful_count } : c
          ));
        }
      });
  };

  const renderStars = (ratingValue, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = interactive ? (hoverRating || rating) >= starValue : ratingValue >= starValue;
      
      return (
        <button
          key={index}
          type={interactive ? "button" : "submit"}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${isActive ? 'text-warning' : 'text-border'}`}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          onClick={() => interactive && setRating(starValue)}
        >
          <Star size={interactive ? 24 : 16} fill={isActive ? "currentColor" : "none"} strokeWidth={isActive ? 0 : 2} />
        </button>
      );
    });
  };

  return (
    <div className="mt-10 pt-8 border-t border-border">
      {/* Başlık ve Özet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
            <MessageSquare className="text-primary" /> Yorumlar ve Değerlendirmeler
          </h3>
          <p className="text-sm text-muted mt-1">
            {meta.total_count} değerlendirme, ortalama {meta.avg_rating || 0} puan
          </p>
        </div>
        
        {meta.avg_rating && (
          <div className="flex items-center gap-3 bg-secondary/5 px-4 py-2 rounded-lg border border-secondary/10">
            <div className="flex">{renderStars(Math.round(meta.avg_rating))}</div>
            <span className="text-xl font-bold text-secondary">{meta.avg_rating}</span>
          </div>
        )}
      </div>

      {/* Yorum Yapma Formu */}
      {user ? (
        <div className="bg-surface border border-border p-5 rounded-lg mb-8 shadow-sm">
          <h4 className="font-bold text-foreground mb-4">Değerlendirmenizi Paylaşın</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-foreground/80">Puanınız:</span>
              <div className="flex gap-1">{renderStars(0, true)}</div>
            </div>
            
            <textarea 
              rows="3" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Düşüncelerinizi buraya yazın..."
              className="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none bg-background text-sm"
              required
            ></textarea>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {submitStatus === 'success' && <span className="text-success">Değlendirmeniz başarıyla eklendi!</span>}
                {submitStatus === 'error' && (
                  <span className="text-error">{submitError || 'Bir hata oluştu veya giriş yapmadınız.'}</span>
                )}
              </div>
              <button 
                type="submit" 
                disabled={submitStatus === 'loading'}
                className="px-6 py-2 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 text-sm"
              >
                {submitStatus === 'loading' ? 'Gönderiliyor...' : 'Yorumu Gönder'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <p className="text-foreground/80">Yorum yapabilmek için <a href="/login" className="text-primary hover:underline font-medium">giriş yapmalısınız</a>.</p>
        </div>
      )}

      {/* Filtreleme ve Yorum Listesi */}
      <div className="space-y-6">
        <div className="flex justify-end">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-border rounded-sm px-3 py-1.5 bg-background focus:outline-none focus:border-primary"
          >
            <option value="newest">En Yeni</option>
            <option value="highest">En Yüksek Puan</option>
            <option value="lowest">En Düşük Puan</option>
            <option value="helpful">En Faydalı</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted text-sm">Yorumlar yükleniyor...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-muted bg-muted-bg/50 rounded-lg border border-dashed border-border">
            Henüz yorum yapılmamış. İlk değerlendiren siz olun!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-surface border border-border p-5 rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-foreground">{comment.user?.name || `Kullanıcı #${comment.user_id}`}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">{renderStars(comment.rating)}</div>
                    <span className="text-xs text-muted">• {new Date(comment.createdAt || comment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                
                {comment.is_verified_purchase && (
                  <div className="flex items-center gap-1 text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-sm">
                    <ShieldCheck size={14} /> {targetType === 'artwork' ? 'Doğrulanmış Alıcı' : 'Doğrulanmış Katılımcı'}
                  </div>
                )}
              </div>
              
              <p className="text-foreground/80 text-sm leading-relaxed">{comment.content}</p>
              
              {comment.admin_reply && (
                <div className="mt-3 bg-muted-bg p-3 rounded-sm border-l-2 border-primary text-sm">
                  <strong className="text-primary block mb-1 text-xs uppercase tracking-wider">Yetkili Yanıtı</strong>
                  <p className="text-foreground/80">{comment.admin_reply}</p>
                </div>
              )}
              
              <div className="pt-3 flex items-center gap-4">
                <button 
                  onClick={() => handleHelpful(comment.id)}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    votedComments.includes(comment.id) ? 'text-primary' : 'text-muted hover:text-primary'
                  }`}
                >
                  <ThumbsUp size={14} fill={votedComments.includes(comment.id) ? "currentColor" : "none"} /> Faydalı ({comment.helpful_count})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
