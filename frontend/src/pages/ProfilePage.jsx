import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Star, Package, CheckCircle2, Truck, Home, Clock, Palette } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// ─── Sipariş Durumu Konfigürasyonu ───────────────
const ORDER_STEPS = [
  { key: 'pending',   label: 'Sipariş Alındı',     icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-500' },
  { key: 'confirmed', label: 'Sipariş Onaylandı',   icon: CheckCircle2, color: 'text-blue-500',    bg: 'bg-blue-500'  },
  { key: 'shipped',   label: 'Kargoya Verildi',      icon: Truck,        color: 'text-purple-500',  bg: 'bg-purple-500'},
  { key: 'delivered', label: 'Teslim Edildi',        icon: Home,         color: 'text-success',     bg: 'bg-success'   },
];
const STATUS_INDEX = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 };

const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [user, setUser] = useState(null);
  
  // Orders State
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [cancelModal, setCancelModal] = useState(null); // { orderId, reason }
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  
  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDataStr = localStorage.getItem('user');

    if (!token || !userDataStr) {
      navigate('/login');
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      setUser(userData);
      setName(userData.name || '');
      setEmail(userData.email || '');


    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  // Sekme değiştirme: hem state hem URL güncellenir
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders' && user) fetchOrders();
    if (activeTab === 'reviews' && user) fetchReviews();
  }, [activeTab, user]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError('');
    try {
      const res = await fetch(`${API_URL}/orders?user_id=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        if (data.data.length === 0) {
          setOrdersError('siparis_yok');
        }
      } else {
        setOrdersError('Siparışler alınamadı: ' + (data.message || 'Sunucu hatası'));
      }
    } catch (e) {
      console.error('Sipariş çekme hatası:', e);
      setOrdersError('Sunucuya bağlanılamadı.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelModal?.reason?.trim() || cancelModal.reason.trim().length < 5) {
      alert('Lütfen en az 5 karakterlik bir iptal sebebi girin.');
      return;
    }
    setCancelSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/orders/${cancelModal.orderId}/cancel-request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_reason: cancelModal.reason })
      });
      const data = await res.json();
      if (data.success) {
        setCancelModal(null);
        fetchOrders();
      } else {
        alert(data.message || 'Bir hata oluştu.');
      }
    } catch {
      alert('Sunucuya bağlanılamadı.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`http://localhost:5000/api/comments?user_id=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setIsUpdatingProfile(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncellenirken bir hata oluştu.');
      }

      setProfileMessage({ type: 'success', text: 'Profil başarıyla güncellendi.' });
      
      // Update local storage user data
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Trigger storage event to update navbar if necessary
      window.dispatchEvent(new Event("storage"));

    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }

    setIsUpdatingPassword(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Şifre güncellenirken bir hata oluştu.');
      }

      setPasswordMessage({ type: 'success', text: 'Şifre başarıyla güncellendi.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return <div className="text-center py-10">Yükleniyor...</div>;

  return (
    <>
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-serif text-primary mb-8">Hesabım</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
            <button 
              onClick={() => handleTabChange('orders')}
              className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
            >
              Tüm Siparişlerim
            </button>
            <button 
              onClick={() => handleTabChange('reservations')}
              className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'reservations' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
            >
              Etkinlikler
            </button>
            <button 
              onClick={() => handleTabChange('reviews')}
              className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'reviews' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
            >
              Değerlendirmelerim
            </button>
            <button 
              onClick={() => handleTabChange('profile')}
              className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
            >
              Kullanıcı Bilgileri
            </button>
            <button 
              onClick={() => handleTabChange('password')}
              className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'password' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
            >
              Şifre Değiştir
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            
            {/* Profil Bilgileri Sekmesi */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">Profil Bilgileri</h2>
                
                {profileMessage.text && (
                  <div className={`mb-6 p-4 rounded-lg text-sm border font-medium ${profileMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400'}`}>
                    {profileMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground/80">Ad Soyad</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground/80">E-posta Adresi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isUpdatingProfile ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Şifre Değiştirme Sekmesi */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">Şifre Değiştir</h2>
                
                {passwordMessage.text && (
                  <div className={`mb-6 p-4 rounded-lg text-sm border font-medium ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400' : 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400'}`}>
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground/80">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground/80">Yeni Şifre</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground/80">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Geçmiş Siparişler Sekmesi */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">Tüm Siparişlerim</h2>

                {isLoadingOrders ? (
                  <div className="text-center py-12 text-foreground/60">Siparişler yükleniyor...</div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-foreground/60 border border-dashed border-white/10 rounded-xl space-y-3">
                    <Package size={40} className="mx-auto text-muted" />
                    <p>Henüz bir siparişiniz bulunmuyor.</p>
                    <Link to="/artworks" className="inline-block px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                      Eserlere Göz At
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => {
                      const stepIdx = STATUS_INDEX[order.status] ?? 0;
                      const artwork = order.artwork;
                      return (
                        <div key={order.id} className="border border-border rounded-xl bg-background/50 overflow-hidden">
                          {/* Sipariş Başlığı */}
                          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface">
                            <div className="text-xs text-muted">
                              <span className="font-bold text-foreground">Sipariş #{order.id}</span>
                              <span className="mx-2">·</span>
                              {new Date(order.createdAt || order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-base font-bold text-primary">
                              {Number(order.total_price).toLocaleString('tr-TR')} ₺
                            </div>
                          </div>

                          {/* Eser Bilgisi */}
                          <div className="flex gap-4 p-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted-bg flex-shrink-0 border border-border">
                              {artwork?.image_url
                                ? <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center"><Palette size={20} className="text-muted" /></div>
                              }
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-secondary">{artwork?.title || 'Bilinmeyen Eser'}</p>
                              <p className="text-sm text-muted">{artwork?.artist_name}</p>
                              {/* İptal / Durum Notu */}
                          {order.cancel_requested ? (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium border border-amber-200">⌛ İptal Talebi Gönderildi</span>
                          ) : order.status === 'cancelled' ? (
                            <span className="text-xs bg-red-100 text-error px-2 py-1 rounded-full font-medium border border-error/20">❌ İptal Edildi</span>
                          ) : !['delivered', 'cancelled'].includes(order.status) ? (
                            <button
                              onClick={() => setCancelModal({ orderId: order.id, reason: '' })}
                              className="text-xs border border-error/30 text-error px-3 py-1 rounded-full hover:bg-error/5 transition-colors font-medium"
                            >
                              İptal Talebi
                            </button>
                          ) : null}
                            </div>
                          </div>

                          {/* Durum Zaman Çizelgesi */}
                          <div className="px-5 pb-5">
                            <div className="relative flex items-start justify-between">
                              {/* Connecting line */}
                              <div className="absolute top-4 left-4 right-4 h-0.5 bg-border z-0" />
                              <div
                                className="absolute top-4 left-4 h-0.5 z-0 bg-primary transition-all duration-500"
                                style={{ width: stepIdx === 0 ? '0%' : `${(stepIdx / 3) * 100}%` }}
                              />

                              {ORDER_STEPS.map((step, i) => {
                                const Icon = step.icon;
                                const done = i <= stepIdx;
                                const active = i === stepIdx;
                                return (
                                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5" style={{ width: '25%' }}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      done
                                        ? `${step.bg} border-transparent text-white`
                                        : 'bg-surface border-border text-muted'
                                    } ${active ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                                      <Icon size={14} />
                                    </div>
                                    <p className={`text-[10px] text-center leading-tight ${
                                      active ? 'font-bold text-primary' : done ? 'text-foreground/70' : 'text-muted'
                                    }`}>{step.label}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Rezervasyonlarım Sekmesi */}
            {activeTab === 'reservations' && (
              <div>
                <h2 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">Etkinlikler</h2>
                <div className="p-8 text-center text-foreground/60 border border-dashed border-white/10 rounded-xl">
                  Geliştirici 2: Atölye rezervasyon listesi buraya eklenecek.
                </div>
              </div>
            )}

            {/* Değerlendirmelerim Sekmesi */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-serif mb-6 border-b border-white/10 pb-4">Değerlendirmelerim</h2>
                
                {isLoadingReviews ? (
                  <div className="text-center py-10">Yükleniyor...</div>
                ) : reviews.length === 0 ? (
                  <div className="p-8 text-center text-foreground/60 border border-dashed border-white/10 rounded-xl">
                    Henüz bir değerlendirmeniz bulunmuyor.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map(review => {
                      const target = review.target_type === 'artwork' ? review.artwork : review.workshop;
                      const targetImage = target?.image_url || 'https://via.placeholder.com/100';
                      const targetTitle = target?.title || 'Bilinmeyen Ürün';
                      
                      return (
                        <div key={review.id} className="flex gap-4 p-4 border border-white/10 rounded-xl bg-background/50 hover:bg-white/5 transition-colors">
                          <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                            <img src={targetImage} alt={targetTitle} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium text-foreground mb-1">
                                  <span className="font-bold text-primary mr-2">Artisana</span>
                                  {targetTitle}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-semibold text-foreground/80 mr-1">{review.rating}.0</span>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={14}
                                      className={star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-foreground/20'}
                                    />
                                  ))}
                                  <span className="mx-2 text-foreground/20">|</span>
                                  <span className="text-xs text-foreground/60">
                                    {new Date(review.createdAt || review.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {review.content && (
                              <p className="text-sm mt-1 text-foreground/80">{review.content}</p>
                            )}

                            {review.admin_reply && (
                              <div className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                <p className="text-xs font-semibold text-primary mb-1">Artisana Yanıtı:</p>
                                <p className="text-sm">{review.admin_reply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    {/* ─── İptal Talebi Modalı ─── */}
    {cancelModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCancelModal(null)}>
        <div className="bg-surface rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-serif font-bold text-secondary mb-2">İptal Talebi</h3>
          <p className="text-sm text-muted mb-4">İptal talebiniz admin onayına gönderilecektir. Onaylanması durumunda sipariş iptal edilir ve eser tekrar satışa çıkar.</p>
          <label className="block text-xs font-medium text-muted mb-1">İptal Sebebi *</label>
          <textarea
            rows={4}
            value={cancelModal.reason}
            onChange={e => setCancelModal(p => ({ ...p, reason: e.target.value }))}
            placeholder="Neden iptal etmek istiyorsunuz? (en az 5 karakter)"
            className="w-full p-3 border border-border rounded-lg bg-background text-sm focus:outline-none focus:border-primary resize-none mb-4"
          />
          <div className="flex gap-3">
            <button onClick={() => setCancelModal(null)} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted-bg transition-colors">
              Vazgeç
            </button>
            <button
              onClick={handleCancelRequest}
              disabled={cancelSubmitting}
              className="flex-1 py-2.5 bg-error text-white rounded-lg text-sm font-medium hover:bg-error/90 transition-colors disabled:opacity-50"
            >
              {cancelSubmitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ProfilePage;
