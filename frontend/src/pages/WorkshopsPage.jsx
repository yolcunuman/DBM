import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, X, Search, Tag } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';

const API_URL = 'http://localhost:5000/api';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'reserve' | 'comments'
  const [numParticipants, setNumParticipants] = useState(1);
  const [reservationStatus, setReservationStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const openDetail = (w) => { setSelectedWorkshop(w); setActiveTab('info'); setReservationStatus(''); setNumParticipants(1); };
  const closeDetail = () => { setSelectedWorkshop(null); setReservationStatus(''); };

  const handleReservation = (e) => {
    e.preventDefault();
    setReservationStatus('loading');

    fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 1, workshop_id: selectedWorkshop.id, num_participants: numParticipants, notes: 'Frontend üzerinden' })
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setReservationStatus('success');
          const updated = workshops.map(w => w.id === selectedWorkshop.id ? { ...w, enrolled: w.enrolled + numParticipants } : w);
          setWorkshops(updated);
          setSelectedWorkshop(prev => ({ ...prev, enrolled: prev.enrolled + numParticipants }));
        } else {
          setReservationStatus('error: ' + d.message);
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
                  : <div className="w-full h-full flex items-center justify-center text-primary-light font-serif text-2xl opacity-30">Artisana</div>
                }
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-sm text-xs font-bold text-primary">{w.category}</div>
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
                  <div className="text-xl font-bold text-secondary">{Number(w.price).toLocaleString('tr-TR')} ₺</div>
                  <button onClick={() => openDetail(w)}
                    className="px-4 py-2 bg-primary text-white rounded-sm text-sm font-medium hover:bg-primary-dark transition-colors">
                    Detaylar
                  </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Modal Üst: Görsel + Başlık */}
            <div className="relative h-56 bg-muted-bg">
              {selectedWorkshop.image_url
                ? <img src={selectedWorkshop.image_url} alt={selectedWorkshop.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-primary-light font-serif text-3xl opacity-30">Artisana</div>
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
                  <button onClick={() => setActiveTab('reserve')}
                    disabled={selectedWorkshop.enrolled >= selectedWorkshop.capacity}
                    className="w-full py-3 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {selectedWorkshop.enrolled >= selectedWorkshop.capacity ? 'Kontenjan Doldu' : 'Rezervasyon Yap →'}
                  </button>
                </div>
              )}

              {/* Tab: Rezervasyon */}
              {activeTab === 'reserve' && (
                <form onSubmit={handleReservation} className="space-y-5">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h3 className="font-bold text-secondary mb-1">{selectedWorkshop.title}</h3>
                    <p className="text-sm text-muted">{formatDate(selectedWorkshop.date)} • {formatTime(selectedWorkshop.start_time)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Katılımcı Sayısı</label>
                    <input type="number" min="1" max={selectedWorkshop.capacity - selectedWorkshop.enrolled}
                      value={numParticipants} onChange={e => setNumParticipants(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2.5 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" required />
                    <p className="text-xs text-muted mt-1">Maksimum: {selectedWorkshop.capacity - selectedWorkshop.enrolled} kişi</p>
                  </div>
                  <div className="bg-muted-bg p-4 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-secondary">Toplam Ücret:</span>
                    <span className="text-2xl font-bold text-primary">{(selectedWorkshop.price * numParticipants).toLocaleString('tr-TR')} ₺</span>
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
              )}

              {/* Tab: Yorumlar */}
              {activeTab === 'comments' && (
                <CommentsSection targetType="workshop" targetId={selectedWorkshop.id} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsPage;
