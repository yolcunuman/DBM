import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, X, Search, Tag, Scale } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';
import { useToast } from '../hooks/useToast';

const API_URL = 'http://localhost:5001/api';

const VALID_COUPONS = {
  'SANAT10': { discount: 10, label: '%10 İndirim' },
  'YAZ10': { discount: 10, label: '%10 Yaz Fırsatı İndirimi' },
  'GALERIST20': { discount: 20, label: '%20 İndirim' },
  'HOSGELDIN': { discount: 15, label: '%15 Hoş Geldin İndirimi' },
};

const CAMPAIGN_WORKSHOPS = {
  1: { discount: 20, tag: 'Erken Kayıt Fırsatı' },
  5: { discount: 15, tag: 'Son Kalan Kontenjanlar' },
  8: { discount: 25, tag: 'Haftanın Atölyesi' }
};

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [numParticipants, setNumParticipants] = useState(1);
  const [reservationStatus, setReservationStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { showToast, ToastUI } = useToast();
  
  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Customizable Date & Time States
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNo, setCardNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleAddToCompare = (workshop, e) => {
    if (e) e.stopPropagation();
    const item = {
      id: workshop.id,
      title: workshop.title,
      imageUrl: workshop.image_url,
      price: workshop.price,
      category: workshop.category,
      instructor: workshop.instructor,
      date: workshop.date,
      start_time: workshop.start_time,
      end_time: workshop.end_time,
      location: workshop.location,
      capacity: workshop.capacity,
      enrolled: workshop.enrolled
    };
    try {
      const stored = localStorage.getItem('galerist_compare');
      let compareList = stored ? JSON.parse(stored) : [];
      if (compareList.length > 0 && compareList[0].type !== 'workshop') {
        compareList = [];
      }
      if (compareList.some(i => i.id === item.id)) {
        showToast('Bu atölye zaten karşılaştırma listesinde.', 'info');
        return;
      }
      if (compareList.length >= 3) {
        showToast('En fazla 3 atölyeyi karşılaştırabilirsiniz.', 'error');
        return;
      }
      compareList.push({ ...item, type: 'workshop' });
      localStorage.setItem('galerist_compare', JSON.stringify(compareList));
      window.dispatchEvent(new Event('galerist-compare-updated'));
      showToast('Atölye karşılaştırma listesine eklendi!', 'success');
    } catch (err) { console.error(err); }
  };

  const fetchWorkshops = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedCategory) params.append('category', selectedCategory);
    fetch(`${API_URL}/workshops?${params}`)
      .then(r => r.json())
      .then(d => { if (d.success) setWorkshops(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API_URL}/workshops/categories`).then(r => r.json()).then(d => { if (d.success) setCategories(d.data); });
  }, []);

  useEffect(() => { fetchWorkshops(); }, [selectedCategory]);

  const openDetail = (w) => { 
    setSelectedWorkshop(w); 
    setActiveTab('info'); 
    setReservationStatus(''); 
    setNumParticipants(1); 
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setCustomDate(w.date || '');
    setCustomTime(w.start_time?.slice(0, 5) || '10:00');
  };
  const closeDetail = () => { setSelectedWorkshop(null); setReservationStatus(''); };

  const applyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Lütfen bir kupon kodu girin.'); return; }
    const found = VALID_COUPONS[code];
    if (found) {
      setAppliedCoupon({ code, ...found });
      setCouponCode('');
    } else {
      setCouponError('Geçersiz kupon kodu.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleReservation = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setReservationStatus('error: Rezervasyon yapmak için giriş yapmalısınız.');
      return;
    }
    if (selectedWorkshop?.title?.includes('Seçilebilir')) {
      if (!customDate) {
        setReservationStatus('error: Lütfen tercih ettiğiniz tarihi seçin.');
        return;
      }
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      if (customDate < todayStr) {
        setReservationStatus('error: Tercih edilen tarih geçmiş bir tarih olamaz.');
        return;
      }
    }

    if (!agreeTerms) {
      setReservationStatus('error: Lütfen Mesafeli Satış ve Rezervasyon Sözleşmesi\'ni onaylayın.');
      return;
    }

    if (paymentMethod === 'credit_card') {
      const cleanNo = cardNo.replace(/\s/g, '');
      if (cleanNo.length !== 16) {
        setReservationStatus('error: Lütfen 16 haneli geçerli bir kart numarası girin.');
        return;
      }
      if (!cardName.trim()) {
        setReservationStatus('error: Lütfen kart üzerindeki adı girin.');
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        setReservationStatus('error: Lütfen geçerli bir son kullanma tarihi girin (AA/YY).');
        return;
      }
      if (cardCvv.length !== 3) {
        setReservationStatus('error: Lütfen 3 haneli CVV kodunu girin.');
        return;
      }
    }

    setReservationStatus('loading');

    const isFlexible = selectedWorkshop.title.includes('Seçilebilir');

    // Build the notes detailing the payment method
    let paymentNotes = '';
    if (paymentMethod === 'credit_card') {
      paymentNotes = `[Ödeme: Kredi Kartı] [Kart: **** **** **** ${cardNo.slice(-4)}]`;
    } else {
      paymentNotes = `[Ödeme: Havale/EFT]`;
    }

    let finalNotes = isFlexible 
      ? `Tercih Edilen Saat: ${customTime} | ${paymentNotes}`
      : paymentNotes;

    fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        workshop_id: selectedWorkshop.id, 
        num_participants: numParticipants, 
        notes: finalNotes,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        chosen_date: isFlexible ? customDate : selectedWorkshop.date,
        chosen_time: isFlexible ? customTime : null
      })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setReservationStatus('success');
          const updated = workshops.map(w => w.id === selectedWorkshop.id ? { ...w, enrolled: w.enrolled + numParticipants } : w);
          setWorkshops(updated);
          setSelectedWorkshop(prev => ({ ...prev, enrolled: prev.enrolled + numParticipants }));
          
          // Clear states
          setCardNo('');
          setCardName('');
          setCardExpiry('');
          setCardCvv('');
          setAgreeTerms(false);
        } else {
          const errMsg = d.message || d.error || 'Rezervasyon oluşturulamadı.';
          setReservationStatus('error: ' + errMsg);
        }
      })
      .catch(() => setReservationStatus('error: Sunucu hatası'));
  };

  const getOccupancyColor = (w) => {
    const pct = w.capacity > 0 ? (w.enrolled / w.capacity) * 100 : 0;
    if (pct >= 100) return 'text-error';
    if (pct >= 75) return 'text-warning';
    return 'text-success';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t) => t?.slice(0, 5);

  if (loading && workshops.length === 0) return <div className="text-center py-20 text-muted">Atölyeler yükleniyor...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Başlık */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-serif font-bold text-secondary">Sanat Atölyeleri & Etkinlikler</h1>
        <p className="text-muted max-w-2xl mx-auto">Uzman eğitmenler eşliğinde yaratıcılığınızı keşfedin. Kontenjanlar dolmadan yerinizi ayırtın.</p>
      </div>

      {/* Arama & Filtreler */}
      <div className="bg-surface border border-border rounded-lg p-4 flex flex-col md:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchWorkshops(); }} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Atölye veya eğitmen ara..."
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-sm text-sm bg-background focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-dark transition-colors">Ara</button>
        </form>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-sm bg-background text-sm focus:outline-none focus:border-primary">
          <option value="">Tüm Kategoriler</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Atölye Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map(w => {
          const available = w.capacity - w.enrolled;
          const isFull = available <= 0;
          const pct = w.capacity > 0 ? Math.round((w.enrolled / w.capacity) * 100) : 0;
          return (
            <div key={w.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
              {/* Görsel */}
              <div className="relative h-52 bg-muted-bg overflow-hidden">
                {w.image_url
                  ? <img src={w.image_url} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  : <div className="w-full h-full flex items-center justify-center text-primary-light font-serif text-2xl opacity-30">Galerist</div>
                }
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-primary">{w.category}</div>
                {/* Kampanya Badge */}
                {CAMPAIGN_WORKSHOPS[w.id] && (
                  <div className="absolute top-10 left-3 bg-amber-500 text-white px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 animate-pulse z-10">
                    🔥 {CAMPAIGN_WORKSHOPS[w.id].tag}
                  </div>
                )}
                {isFull && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-error text-white px-4 py-2 rounded-sm font-bold text-sm">KONTENJAN DOLDU</span>
                  </div>
                )}
              </div>

              {/* İçerik */}
              <div className="p-5 flex flex-col flex-1 space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-secondary leading-tight">{w.title}</h3>
                  <p className="text-sm text-primary font-medium mt-0.5">Eğitmen: {w.instructor}</p>
                </div>
                <p className="text-xs text-muted line-clamp-2">{w.description}</p>

                {/* Bilgi Satırları */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-foreground/70"><Calendar size={14} className="text-primary flex-shrink-0" />{formatDate(w.date)}</div>
                  <div className="flex items-center gap-2 text-foreground/70"><Clock size={14} className="text-primary flex-shrink-0" />{formatTime(w.start_time)} – {formatTime(w.end_time)}</div>
                  <div className="flex items-center gap-2 text-foreground/70"><MapPin size={14} className="text-primary flex-shrink-0" /><span className="line-clamp-1">{w.location || 'Belirtilmedi'}</span></div>
                  <div className={`flex items-center gap-2 font-medium ${getOccupancyColor(w)}`}>
                    <Users size={14} className="flex-shrink-0" />
                    {isFull ? 'Kontenjan doldu' : `${available} kişilik yer kaldı`}
                    <span className="ml-auto text-xs text-muted">{w.enrolled}/{w.capacity}</span>
                  </div>
                </div>

                {/* Doluluk Çubuğu */}
                <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-error' : pct >= 75 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>

                {/* Alt: Fiyat + Buton */}
                <div className="pt-2 border-t border-border flex items-center justify-between mt-auto">
                  <div>
                    {CAMPAIGN_WORKSHOPS[w.id] ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted line-through">
                          {Math.round(Number(w.price) * (1 + CAMPAIGN_WORKSHOPS[w.id].discount / 100)).toLocaleString('tr-TR')} ₺
                        </span>
                        <span className="text-base font-bold text-amber-500">
                          {Number(w.price).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-secondary">{Number(w.price).toLocaleString('tr-TR')} ₺</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => handleAddToCompare(w, e)}
                      className="p-2 border border-border rounded-sm hover:bg-muted-bg text-muted hover:text-primary transition-colors"
                      title="Karşılaştır"
                    >
                      <Scale size={16} />
                    </button>
                    <button onClick={() => openDetail(w)}
                      className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-dark transition-colors">
                      Detaylar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {workshops.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-muted bg-muted-bg/30 rounded-lg border border-dashed border-border">
            Aradığınız kriterlere uygun atölye bulunamadı.
          </div>
        )}
      </div>

      {/* Detay Modalı */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 md:pt-24 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto animate-scale-in">
            {/* Modal Üst: Görsel + Başlık */}
            <div className="relative h-56 bg-muted-bg">
              {selectedWorkshop.image_url
                ? <img src={selectedWorkshop.image_url} alt={selectedWorkshop.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-primary-light font-serif text-3xl opacity-30">Galerist</div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button onClick={closeDetail} className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors z-10">
                <X size={18} />
              </button>
              <div className="absolute bottom-4 left-5 right-14">
                <span className="text-xs font-bold text-white/80 bg-primary/80 px-2 py-0.5 rounded mb-1 inline-block">{selectedWorkshop.category}</span>
                <h2 className="text-2xl font-serif font-bold text-white">{selectedWorkshop.title}</h2>
                <p className="text-sm text-white/80">Eğitmen: {selectedWorkshop.instructor}</p>
              </div>
            </div>

            {/* Tab Menüsü */}
            <div className="flex border-b border-border px-5">
              {['info', 'reserve', 'comments'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'}`}>
                  {tab === 'info' ? 'Detaylar' : tab === 'reserve' ? 'Rezervasyon' : 'Yorumlar & Değerlendirmeler'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Tab: Detaylar */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <p className="text-foreground/80 leading-relaxed">{selectedWorkshop.description}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Calendar size={18} className="text-primary" />, label: 'Tarih', value: formatDate(selectedWorkshop.date) },
                      { icon: <Clock size={18} className="text-primary" />, label: 'Saat', value: `${formatTime(selectedWorkshop.start_time)} – ${formatTime(selectedWorkshop.end_time)}` },
                      { icon: <MapPin size={18} className="text-primary" />, label: 'Konum', value: selectedWorkshop.location || 'Belirtilmedi' },
                      { icon: <Users size={18} className="text-primary" />, label: 'Kontenjan', value: `${selectedWorkshop.enrolled}/${selectedWorkshop.capacity} (${selectedWorkshop.capacity - selectedWorkshop.enrolled} yer kaldı)` },
                      { icon: <Tag size={18} className="text-primary" />, label: 'Kategori', value: selectedWorkshop.category },
                      { icon: <span className="text-primary font-bold text-sm">₺</span>, label: 'Ücret', value: `${Number(selectedWorkshop.price).toLocaleString('tr-TR')} ₺ / kişi` },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 bg-muted-bg/50 p-3 rounded-lg border border-border">
                        <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
                        <div><p className="text-xs text-muted">{item.label}</p><p className="text-sm font-medium text-foreground">{item.value}</p></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setActiveTab('reserve')}
                      disabled={selectedWorkshop.enrolled >= selectedWorkshop.capacity}
                      className="flex-1 py-3 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {selectedWorkshop.enrolled >= selectedWorkshop.capacity ? 'Kontenjan Doldu' : 'Rezervasyon Yap →'}
                    </button>
                    <button onClick={(e) => handleAddToCompare(selectedWorkshop, e)}
                      className="px-4 py-3 border border-border hover:bg-muted-bg rounded-sm font-medium text-foreground/70 hover:text-primary transition-all flex items-center justify-center gap-1.5"
                    >
                      <Scale size={18} /> Karşılaştır
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Rezervasyon */}
              {activeTab === 'reserve' && (
                !localStorage.getItem('token') ? (
                  <div className="text-center py-8 space-y-4 border border-dashed border-border rounded-lg bg-muted-bg/30">
                    <p className="text-muted text-sm">Rezervasyon yapabilmek için lütfen önce giriş yapın.</p>
                    <a href="/login" className="inline-block px-6 py-2.5 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors text-sm">
                      Giriş Yap
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleReservation} className="space-y-5">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-bold text-secondary mb-1">{selectedWorkshop.title}</h3>
                      <p className="text-sm text-muted">{formatDate(selectedWorkshop.date)} • {formatTime(selectedWorkshop.start_time)}</p>
                    </div>

                    {selectedWorkshop.title.includes('Seçilebilir') && (
                      <div className="grid grid-cols-2 gap-4 border border-dashed border-primary/30 p-4 rounded-lg bg-primary/5">
                        <div className="col-span-2 text-xs font-bold text-primary uppercase tracking-wider">🗓️ Kişiye Özel Tarih & Saat Seçimi</div>
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Tercih Ettiğiniz Tarih</label>
                          <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-background text-sm text-foreground" required />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted mb-1">Tercih Ettiğiniz Saat</label>
                          <input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-background text-sm text-foreground" required />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Katılımcı Sayısı</label>
                      <input type="number" min="1" max={selectedWorkshop.capacity - selectedWorkshop.enrolled}
                        value={numParticipants} onChange={e => setNumParticipants(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background" required />
                      <p className="text-xs text-muted mt-1">Maksimum: {selectedWorkshop.capacity - selectedWorkshop.enrolled} kişi</p>
                    </div>

                    {/* Kupon Kodu Girişi */}
                    <div className="border-t border-border pt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">İndirim Kuponu</label>
                      {appliedCoupon ? (
                        <div className="flex justify-between items-center bg-success/5 border border-success/20 p-2.5 rounded-sm">
                          <div className="text-sm text-success font-medium">
                            🎟️ {appliedCoupon.code} uygulandı ({appliedCoupon.label})
                          </div>
                          <button type="button" onClick={removeCoupon} className="text-xs text-error hover:underline">
                            Kuponu Kaldır
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)}
                            placeholder="Örn: YAZ10"
                            className="flex-1 px-4 py-2 border border-border rounded-sm text-sm uppercase bg-background focus:outline-none focus:border-primary" />
                          <button type="button" onClick={applyCoupon}
                            className="px-4 py-2 bg-secondary text-white rounded-sm text-sm font-medium hover:bg-secondary-dark transition-colors">
                            Uygula
                          </button>
                        </div>
                      )}
                      {couponError && <p className="text-xs text-error mt-1">{couponError}</p>}
                    </div>

                    {/* Ödeme Yöntemi ve Bilgileri */}
                    <div className="border-t border-border pt-4 space-y-3">
                      <label className="block text-sm font-medium text-foreground mb-1 font-bold">Ödeme Yöntemi Seçin *</label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-2 p-2.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border text-muted hover:border-primary/50'}`}>
                          <input type="radio" name="paymentMethod" value="credit_card" checked={paymentMethod === 'credit_card'} onChange={() => setPaymentMethod('credit_card')} className="accent-primary" />
                          <span className="text-xs">Kredi / Banka Kartı</span>
                        </label>
                        <label className={`flex items-center gap-2 p-2.5 border rounded-sm cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-border text-muted hover:border-primary/50'}`}>
                          <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-primary" />
                          <span className="text-xs">Havale / EFT</span>
                        </label>
                      </div>

                      {paymentMethod === 'credit_card' ? (
                        <div className="bg-muted-bg/50 border border-border rounded-lg p-3 space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-muted mb-1">Kart Numarası</label>
                            <input 
                              type="text" 
                              value={cardNo} 
                              onChange={e => setCardNo(e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim())} 
                              placeholder="0000 0000 0000 0000" 
                              maxLength={19} 
                              className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary" 
                              required={paymentMethod === 'credit_card'}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-muted mb-1">Kart Üzerindeki İsim</label>
                            <input 
                              type="text" 
                              value={cardName} 
                              onChange={e => setCardName(e.target.value)} 
                              placeholder="Ad Soyad" 
                              className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary" 
                              required={paymentMethod === 'credit_card'}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-muted mb-1">S.K. Tarihi</label>
                              <input 
                                type="text" 
                                value={cardExpiry} 
                                onChange={e => { let v = e.target.value.replace(/\D/g,''); if(v.length>=2) v=v.slice(0,2)+'/'+v.slice(2,4); setCardExpiry(v); }} 
                                placeholder="AA/YY" 
                                maxLength={5} 
                                className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary" 
                                required={paymentMethod === 'credit_card'}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-muted mb-1">CVV</label>
                              <input 
                                type="text" 
                                value={cardCvv} 
                                onChange={e => setCardCvv(e.target.value.replace(/\D/g,''))} 
                                placeholder="CVV" 
                                maxLength={3} 
                                className="w-full px-3 py-2 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary" 
                                required={paymentMethod === 'credit_card'}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted-bg/50 border border-border rounded-lg p-3 text-xs space-y-2 text-muted leading-relaxed">
                          <p className="font-bold text-secondary">Banka Hesap Bilgilerimiz:</p>
                          <p><strong>Banka:</strong> Galerist Sanat A.Ş.</p>
                          <p><strong>IBAN:</strong> TR99 0006 2000 0000 1234 5678 90</p>
                          <p className="text-[10px] text-error-light">* Lütfen havale açıklama kısmına kayıt olduğunuz atölye ismini yazınız.</p>
                        </div>
                      )}
                    </div>

                    {/* Sözleşme Onayı */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2 text-xs cursor-pointer text-muted leading-relaxed">
                        <input 
                          type="checkbox" 
                          checked={agreeTerms} 
                          onChange={e => setAgreeTerms(e.target.checked)} 
                          className="accent-primary w-4 h-4 mt-0.5" 
                          required 
                        />
                        <span>
                          <span className="text-primary hover:underline font-medium">Mesafeli Satış Sözleşmesi</span> ve <span className="text-primary hover:underline font-medium">Rezervasyon Koşullarını</span> okudum, onaylıyorum.
                        </span>
                      </label>
                    </div>

                    <div className="bg-muted-bg p-4 rounded-lg space-y-2 border border-border">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted">Ara Toplam:</span>
                        <span className="font-medium text-foreground">{(selectedWorkshop.price * numParticipants).toLocaleString('tr-TR')} ₺</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between items-center text-sm text-success font-medium">
                          <span>İndirim (%{appliedCoupon.discount}):</span>
                          <span>- {((selectedWorkshop.price * numParticipants * appliedCoupon.discount) / 100).toLocaleString('tr-TR')} ₺</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-border/60 pt-2 font-bold text-secondary">
                        <span>Toplam Ücret:</span>
                        <span className="text-2xl text-primary font-bold">
                          {(
                            selectedWorkshop.price * numParticipants -
                            (appliedCoupon ? (selectedWorkshop.price * numParticipants * appliedCoupon.discount) / 100 : 0)
                          ).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    </div>

                    {reservationStatus === 'success' && (
                      <div className="text-success bg-success/10 border border-success/20 p-3 rounded-lg text-sm">✅ Rezervasyonunuz başarıyla oluşturuldu!</div>
                    )}
                    {reservationStatus.startsWith('error') && (
                      <div className="text-error bg-error/10 border border-error/20 p-3 rounded-lg text-sm">{reservationStatus.replace('error: ', '')}</div>
                    )}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setActiveTab('info')}
                        className="flex-1 py-2.5 border border-border rounded-sm text-foreground/70 hover:bg-muted-bg transition-colors text-sm">
                        Geri
                      </button>
                      <button type="submit" disabled={reservationStatus === 'loading' || reservationStatus === 'success'}
                        className="flex-1 py-2.5 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm">
                        {reservationStatus === 'loading' ? 'İşleniyor...' : 'Rezervasyonu Onayla'}
                      </button>
                    </div>
                  </form>
                )
              )}

              {/* Tab: Yorumlar */}
              {activeTab === 'comments' && (
                <CommentsSection targetType="workshop" targetId={selectedWorkshop.id} />
              )}
            </div>
          </div>
        </div>
      )}
      {ToastUI}
    </div>
  );
};

export default WorkshopsPage;
