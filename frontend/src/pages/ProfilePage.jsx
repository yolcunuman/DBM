import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Star, Package, CheckCircle2, Truck, Home, Clock, Palette } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

// ─── Sipariş Durumu Konfigürasyonu ───────────────
const ORDER_STEPS = [
  { key: 'pending', label: 'Sipariş Alındı', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
  { key: 'confirmed', label: 'Sipariş Onaylandı', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500' },
  { key: 'shipped', label: 'Kargoya Verildi', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500' },
  { key: 'delivered', label: 'Teslim Edildi', icon: Home, color: 'text-success', bg: 'bg-success' },
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

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState('');
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editParticipants, setEditParticipants] = useState(1);

  // Filter States
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');

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
    if (activeTab === 'reservations' && user) fetchReservations();
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
      const response = await fetch(`http://localhost:5001/api/comments?user_id=${user.id}`);
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

  const fetchReservations = async () => {
    setIsLoadingReservations(true);
    setReservationsError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReservations(data.data);
      } else {
        setReservationsError(data.message || 'Rezervasyonlar yüklenemedi.');
      }
    } catch (e) {
      console.error('Rezervasyon çekme hatası:', e);
      setReservationsError('Sunucuya bağlanılamadı.');
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        alert('Rezervasyonunuz başarıyla iptal edildi.');
        fetchReservations();
      } else {
        alert(data.message || 'İptal işlemi başarısız.');
      }
    } catch {
      alert('Sunucu hatası oluştu.');
    }
  };

  const handleUpdateReservation = async (id) => {
    if (!editDate) {
      alert('Lütfen geçerli bir tarih seçin.');
      return;
    }
    if (parseInt(editParticipants) < 1) {
      alert('Katılımcı sayısı en az 1 olmalıdır.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservation_date: editDate,
          num_participants: parseInt(editParticipants)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Rezervasyon başarıyla güncellendi.');
        setEditingReservationId(null);
        fetchReservations();
      } else {
        alert(data.message || 'Güncelleme işlemi başarısız.');
      }
    } catch {
      alert('Sunucu hatası oluştu.');
    }
  };


  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setIsUpdatingProfile(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5001/api/auth/profile', {
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
      const response = await fetch('http://localhost:5001/api/auth/password', {
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
              <button
                onClick={() => handleTabChange('offers')}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'offers' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
              >
                🎉 Özel Fırsatlarım
              </button>
              <button
                onClick={() => handleTabChange('comparisons')}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'comparisons' ? 'bg-primary/20 text-primary font-medium' : 'hover:bg-white/10'}`}
              >
                📊 Karşılaştırmalarım
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
                  <h2 className="text-2xl font-serif mb-4 border-b border-white/10 pb-4">Sipariş ve Takip Paneli</h2>

                  {/* Sipariş Filtre Butonları */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { key: 'all', label: 'Tümü', count: orders.length },
                      { key: 'active', label: 'Aktif', count: orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length },
                      { key: 'delivered', label: 'Teslim Edildi', count: orders.filter(o => o.status === 'delivered').length },
                      { key: 'cancelled', label: 'İptal Edildi', count: orders.filter(o => o.status === 'cancelled').length },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setOrderFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${orderFilter === f.key
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                            : 'bg-white/5 text-foreground/70 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

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
                      {orders
                        .filter(order => {
                          if (orderFilter === 'all') return true;
                          if (orderFilter === 'active') return ['pending', 'confirmed', 'shipped'].includes(order.status);
                          if (orderFilter === 'delivered') return order.status === 'delivered';
                          if (orderFilter === 'cancelled') return order.status === 'cancelled';
                          return true;
                        })
                        .map(order => {
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

                              {/* Sipariş Detayları */}
                              <div className="px-5 pb-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-foreground/60 bg-white/3 rounded-lg p-3 border border-white/5">
                                  <div>
                                    <span className="block text-foreground/40 mb-0.5">Miktar</span>
                                    <span className="text-foreground font-medium">{order.quantity} Adet</span>
                                  </div>
                                  <div>
                                    <span className="block text-foreground/40 mb-0.5">Ödeme Yöntemi</span>
                                    <span className="text-foreground font-medium">
                                      {order.payment_method === 'credit_card' ? '💳 Kredi Kartı' : order.payment_method === 'debit_card' ? '💳 Banka Kartı' : order.payment_method === 'bank_transfer' ? '🏦 Havale/EFT' : order.payment_method || '-'}
                                    </span>
                                  </div>
                                  {order.notes && order.notes.includes('[Kupon:') && (
                                    <div>
                                      <span className="block text-foreground/40 mb-0.5">Kupon</span>
                                      <span className="text-success font-medium">
                                        🎟️ {order.notes.match(/\[Kupon:\s*([^\]]+)\]/)?.[1] || '-'}
                                      </span>
                                    </div>
                                  )}
                                  {order.shipping_address && (
                                    <div className="col-span-2 sm:col-span-3">
                                      <span className="block text-foreground/40 mb-0.5">Teslimat Adresi</span>
                                      <span className="text-foreground font-medium">📦 {order.shipping_address}</span>
                                    </div>
                                  )}
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
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done
                                            ? `${step.bg} border-transparent text-white`
                                            : 'bg-surface border-border text-muted'
                                          } ${active ? 'ring-2 ring-offset-2 ring-primary' : ''}`}>
                                          <Icon size={14} />
                                        </div>
                                        <p className={`text-[10px] text-center leading-tight ${active ? 'font-bold text-primary' : done ? 'text-foreground/70' : 'text-muted'
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
                  <h2 className="text-2xl font-serif mb-4 border-b border-white/10 pb-4">Rezervasyon Takip Paneli</h2>

                  {/* Rezervasyon Filtre Butonları */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {[
                      { key: 'all', label: 'Tümü', count: reservations.length },
                      { key: 'active', label: 'Aktif', count: reservations.filter(r => ['pending', 'confirmed'].includes(r.status)).length },
                      { key: 'past', label: 'Geçmiş', count: reservations.filter(r => r.workshop && new Date(r.workshop.date) < new Date() && r.status !== 'cancelled').length },
                      { key: 'cancelled', label: 'İptal Edildi', count: reservations.filter(r => r.status === 'cancelled').length },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => setReservationFilter(f.key)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${reservationFilter === f.key
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                            : 'bg-white/5 text-foreground/70 border-white/10 hover:bg-white/10 hover:border-white/20'
                          }`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

                  {isLoadingReservations ? (
                    <div className="text-center py-12 text-foreground/60">Rezervasyonlar yükleniyor...</div>
                  ) : reservations.length === 0 ? (
                    <div className="p-8 text-center text-foreground/60 border border-dashed border-white/10 rounded-xl space-y-3">
                      <Package size={40} className="mx-auto text-muted" />
                      <p>Henüz bir atölye rezervasyonunuz bulunmuyor.</p>
                      <Link to="/workshops" className="inline-block px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                        Atölyelere Göz At
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reservations
                        .filter(res => {
                          if (reservationFilter === 'all') return true;
                          if (reservationFilter === 'active') return ['pending', 'confirmed'].includes(res.status);
                          if (reservationFilter === 'past') return res.workshop && new Date(res.workshop.date) < new Date() && res.status !== 'cancelled';
                          if (reservationFilter === 'cancelled') return res.status === 'cancelled';
                          return true;
                        })
                        .map(res => {
                          const workshop = res.workshop;
                          const statusLabels = {
                            pending: 'Beklemede',
                            confirmed: 'Onaylandı',
                            cancelled: 'İptal Edildi'
                          };
                          const statusColors = {
                            pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            confirmed: 'bg-success/10 text-success border-success/20',
                            cancelled: 'bg-red-500/10 text-red-500 border-red-500/20'
                          };

                          return (
                            <div key={res.id} className="border border-white/10 rounded-xl bg-background/50 overflow-hidden">
                              {/* Rezervasyon Başlığı */}
                              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
                                <div className="text-xs text-foreground/60">
                                  <span className="font-bold text-foreground">Rezervasyon #{res.id}</span>
                                  <span className="mx-2">·</span>
                                  {new Date(res.reservation_date || res.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <div className="text-base font-bold text-primary">
                                  {Number(res.total_price).toLocaleString('tr-TR')} ₺
                                </div>
                              </div>

                              {/* Atölye Detayı */}
                              <div className="flex flex-col sm:flex-row gap-4 p-5">
                                <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                                  {workshop?.image_url
                                    ? <img src={workshop.image_url} alt={workshop.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><Palette size={24} className="text-muted" /></div>
                                  }
                                </div>
                                <div className="flex-1 space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{workshop?.category}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[res.status] || 'bg-white/5 text-muted'}`}>
                                      {statusLabels[res.status] || res.status}
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-foreground text-lg leading-tight">{workshop?.title || 'Bilinmeyen Atölye'}</h4>
                                  <p className="text-sm text-foreground/60">Eğitmen: <span className="text-foreground">{workshop?.instructor}</span></p>

                                  <div className="text-xs text-foreground/60 space-y-1 pt-1">
                                    <p>🗓️ Tarih: <span className="text-foreground font-medium">
                                      {workshop?.title?.includes('Seçilebilir') && res.reservation_date
                                        ? new Date(res.reservation_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                        : new Date(workshop?.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                      }
                                    </span></p>
                                    <p>⏰ Saat: <span className="text-foreground font-medium">
                                      {(() => {
                                        if (res.notes && res.notes.includes('[Tercih Edilen Saat:')) {
                                          const match = res.notes.match(/\[Tercih Edilen Saat:\s*([^\]\s]+)\]/);
                                          if (match && match[1]) return match[1];
                                        }
                                        return workshop?.start_time?.slice(0, 5);
                                      })()}
                                    </span></p>
                                    <p>📍 Konum: <span className="text-foreground font-medium">{workshop?.location}</span></p>
                                    <p>👥 Katılımcı Sayısı: <span className="text-foreground font-medium">{res.num_participants} Kişi</span></p>
                                    {res.notes && (() => {
                                      const cleanNotes = res.notes
                                        .replace(/\[Tercih Edilen Saat:\s*[^\]]+\]/g, '')
                                        .replace(/\[Ödeme:\s*[^\]]+\]/g, '')
                                        .replace(/\[Kart:\s*[^\]]+\]/g, '')
                                        .trim();
                                      return cleanNotes ? <p>📝 Notlar: <span className="text-foreground italic">{cleanNotes}</span></p> : null;
                                    })()}
                                    {/* Ödeme Detayları */}
                                    {res.notes && res.notes.includes('[Ödeme:') && (
                                      <p>💳 Ödeme: <span className="text-foreground font-medium">
                                        {res.notes.match(/\[Ödeme:\s*([^\]]+)\]/)?.[1] || '-'}
                                      </span></p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* İşlem Butonları */}
                              {editingReservationId === res.id ? (
                                <div className="p-5 border-t border-white/10 bg-white/5 space-y-4">
                                  <h5 className="text-xs font-bold text-foreground">Rezervasyonu Güncelle</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-foreground/60 mb-1">Rezervasyon Tarihi</label>
                                      <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-foreground/60 mb-1">Katılımcı Sayısı</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={editParticipants}
                                        onChange={(e) => setEditParticipants(e.target.value)}
                                        className="w-full bg-background border border-white/10 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingReservationId(null)}
                                      className="text-[10px] border border-white/20 text-foreground px-3.5 py-1 rounded-full hover:bg-white/5 transition-colors"
                                    >
                                      Vazgeç
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateReservation(res.id)}
                                      className="text-[10px] bg-primary text-white px-3.5 py-1 rounded-full hover:bg-primary-dark transition-colors font-medium"
                                    >
                                      Değişiklikleri Kaydet
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                res.status !== 'cancelled' && (
                                  <div className="px-5 pb-4 flex justify-end gap-3 border-t border-white/10 pt-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingReservationId(res.id);
                                        setEditDate(res.reservation_date ? res.reservation_date.substring(0, 10) : (workshop?.date || ''));
                                        setEditParticipants(res.num_participants);
                                      }}
                                      className="text-xs border border-primary/30 text-primary px-4 py-1.5 rounded-full hover:bg-primary/5 transition-colors font-medium"
                                    >
                                      Tarih / Kişi Güncelle
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelReservation(res.id)}
                                      className="text-xs border border-red-500/30 text-red-500 px-4 py-1.5 rounded-full hover:bg-red-500/5 transition-colors font-medium"
                                    >
                                      Rezervasyonu İptal Et
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
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
              {/* Sana Özel Fırsatlar Sekmesi */}
              {activeTab === 'offers' && (() => {
                const hasHistory = orders.length > 0 || reservations.length > 0;
                return (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif mb-2 border-b border-white/10 pb-4">🎉 Sana Özel Fırsatlar</h2>
                    <p className="text-sm text-foreground/70">Artisana topluluğuna katıldığın için senin hesabına tanımladığımız özel indirim kuponları ve avantajlar aşağıdadır:</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Yeni Üye Kuponu */}
                      <div className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between transition-all ${!hasHistory
                          ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20'
                          : 'bg-white/5 border-white/10 opacity-60'
                        }`}>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${!hasHistory ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-muted'}`}>
                              %15 Hoş Geldin
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                              {!hasHistory ? '🔴 Aktif' : '🔒 Süresi Doldu'}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground text-lg leading-tight">İlk Sanat Adımı</h4>
                          <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                            {!hasHistory
                              ? 'Hesabını başarıyla oluşturduğun için tüm eserlerde ve atölyelerde geçerli %15 hoş geldin indirim kuponu!'
                              : 'İlk siparişinizi tamamladığınız için bu kuponun kullanım süresi sona ermiştir.'}
                          </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 font-sans">
                          <code className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-mono text-sm font-bold tracking-wider text-purple-400">HOSGELDIN</code>
                          {!hasHistory ? (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('HOSGELDIN');
                                alert('Kupon kodu kopyalandı: HOSGELDIN');
                              }}
                              className="text-xs bg-purple-500 hover:bg-purple-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Kopyala
                            </button>
                          ) : (
                            <span className="text-xs text-muted font-medium py-1.5">Geçersiz</span>
                          )}
                        </div>
                      </div>

                      {/* Sadakat Kuponu */}
                      <div className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between transition-all ${hasHistory
                          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20'
                          : 'bg-white/5 border-white/10 border-dashed'
                        }`}>
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${hasHistory ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-muted'}`}>
                              %20 VIP Fırsatı
                            </span>
                            <span className="text-[10px] uppercase tracking-wider font-semibold">
                              {hasHistory ? '🟢 Aktif' : '🔒 Kilitli'}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground text-lg leading-tight">Artisana Dostu İndirimi</h4>
                          <p className="text-xs text-foreground/60 mt-1.5 leading-relaxed">
                            {hasHistory
                              ? 'Topluluğumuzda aktif olduğun için tüm alışverişlerinde geçerli %20 VIP sadakat indirimi!'
                              : 'Kilit Açma Şartı: En az 1 atölye rezervasyonu veya eser siparişi gerçekleştirin.'}
                          </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 font-sans">
                          <code className={`px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tracking-wider ${hasHistory
                              ? 'bg-black/30 border-white/10 text-amber-400'
                              : 'bg-transparent border-dashed border-white/5 text-muted/40'
                            }`}>
                            {hasHistory ? 'ARTISANA20' : '??????'}
                          </code>
                          {hasHistory ? (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('ARTISANA20');
                                alert('Kupon kodu kopyalandı: ARTISANA20');
                              }}
                              className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Kopyala
                            </button>
                          ) : (
                            <span className="text-xs text-muted font-medium py-1.5">🔒 Kilitli</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Özel Duyuru */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start mt-4">
                      <span className="text-lg">📢</span>
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-primary">Sana Özel Bilgilendirme</h5>
                        <p className="text-xs text-foreground/70 mt-1 leading-relaxed">Artisana Premium sadakat programı kapsamında, yaptığın alışverişler ve katıldığın atölyeler doğrultusunda sana özel yeni teklifler ve indirimler burada güncellenecektir. Bizi takip etmeye devam et!</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Karşılaştırmalarım Sekmesi */}
              {activeTab === 'comparisons' && (() => {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                const userId = user ? user.id : 'guest';

                let savedList = [];
                try {
                  const stored = localStorage.getItem(`artisana_saved_comparisons_${userId}`);
                  savedList = stored ? JSON.parse(stored) : [];
                } catch (e) {
                  savedList = [];
                }

                const handleDeleteSave = (id) => {
                  const updated = savedList.filter(item => item.id !== id);
                  localStorage.setItem(`artisana_saved_comparisons_${userId}`, JSON.stringify(updated));
                  handleTabChange('comparisons');
                };

                const handleLoadSave = (saved) => {
                  localStorage.setItem('artisana_compare', JSON.stringify(saved.items));
                  window.dispatchEvent(new Event('artisana-compare-updated'));
                  alert(`"${saved.title}" karşılaştırması aktif edildi! Sayfanın altındaki karşılaştırma çubuğundan görebilirsiniz.`);
                };

                return (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif mb-2 border-b border-white/10 pb-4">📊 Kaydedilen Karşılaştırmalar</h2>
                    <p className="text-sm text-foreground/70">Daha önce kaydettiğiniz sanat eseri ve atölye karşılaştırma sonuçları aşağıdadır:</p>

                    {savedList.length === 0 ? (
                      <div className="p-8 text-center text-foreground/60 border border-dashed border-white/10 rounded-xl bg-white/5">
                        Henüz kaydedilmiş bir karşılaştırma sonucunuz bulunmuyor. Eserler veya atölyeler sayfalarından karşılaştırma yapıp kaydedebilirsiniz!
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        {savedList.map(saved => (
                          <div key={saved.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${saved.type === 'artwork' ? 'bg-primary/20 text-primary-light' : 'bg-amber-500/20 text-amber-400'}`}>
                                  {saved.type === 'artwork' ? 'Eser Karşılaştırması' : 'Atölye Karşılaştırması'}
                                </span>
                                <span className="text-[10px] text-muted/60">
                                  {new Date(saved.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <h4 className="font-bold text-foreground text-base leading-tight">{saved.title}</h4>
                              <p className="text-xs text-foreground/60 mt-1">
                                Karşılaştırılan Eserler: {saved.items.map(i => `"${i.title}"`).join(', ')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <button
                                onClick={() => handleLoadSave(saved)}
                                className="text-xs bg-primary hover:bg-primary-dark text-white font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Görüntüle
                              </button>
                              <button
                                onClick={() => handleDeleteSave(saved.id)}
                                className="text-xs bg-error/10 hover:bg-error text-error font-semibold p-2 rounded-lg transition-colors"
                                title="Sil"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

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
