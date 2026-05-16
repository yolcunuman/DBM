import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Ticket } from 'lucide-react';
import CommentsSection from '../components/CommentsSection';

const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [numParticipants, setNumParticipants] = useState(1);
  const [reservationStatus, setReservationStatus] = useState('');

  // Backend'den atölyeleri çek
  useEffect(() => {
    fetch('http://localhost:5001/api/workshops')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWorkshops(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Workshops fetch error:', err);
        setLoading(false);
      });
  }, []);

  const handleReservation = (e) => {
    e.preventDefault();
    setReservationStatus('loading');

    // Geliştirici 1 auth sistemini yazana kadar dummy user_id=1 kullanıyoruz
    const reservationData = {
      user_id: 1, 
      workshop_id: selectedWorkshop.id,
      num_participants: numParticipants,
      notes: 'Frontend üzerinden yapıldı'
    };

    fetch('http://localhost:5001/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReservationStatus('success');
          // Kontenjanı güncellemek için atölyeleri tekrar çekebiliriz
          const updatedWorkshops = workshops.map(w => {
            if (w.id === selectedWorkshop.id) {
              return { ...w, enrolled: w.enrolled + numParticipants };
            }
            return w;
          });
          setWorkshops(updatedWorkshops);
          setTimeout(() => {
            setSelectedWorkshop(null);
            setReservationStatus('');
            setNumParticipants(1);
          }, 2000);
        } else {
          setReservationStatus('error: ' + data.message);
        }
      })
      .catch(err => {
        setReservationStatus('error: Sunucu hatası');
      });
  };

  if (loading) {
    return <div className="text-center py-20 text-muted">Atölyeler yükleniyor...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Başlık Alanı */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-secondary">Sanat Atölyeleri</h1>
        <p className="text-muted max-w-2xl mx-auto">Uzman eğitmenler eşliğinde yaratıcılığınızı keşfedin. Kontenjanlar dolmadan yerinizi ayırtın.</p>
      </div>

      {/* Atölye Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.map(workshop => {
          const availableSpots = workshop.capacity - workshop.enrolled;
          const isFull = availableSpots <= 0;

          return (
            <div key={workshop.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-48 bg-muted-bg relative overflow-hidden flex items-center justify-center">
                {workshop.image_url ? (
                  <img src={workshop.image_url} alt={workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-primary-light font-serif text-2xl opacity-50">Artisana</div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-sm text-xs font-bold text-primary">
                  {workshop.category}
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-1">{workshop.title}</h3>
                  <p className="text-sm text-muted">Eğitmen: {workshop.instructor}</p>
                </div>
                
                <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {workshop.date}</div>
                  <div className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {workshop.start_time.slice(0,5)} - {workshop.end_time.slice(0,5)}</div>
                  <div className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {workshop.location || 'Belirtilmedi'}</div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className={isFull ? 'text-error' : 'text-primary'} /> 
                    {isFull ? <span className="text-error font-medium">Kontenjan Doldu</span> : <span>{availableSpots} kişilik boş yer</span>}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-lg font-bold text-secondary">{workshop.price} TL</div>
                  <button 
                    onClick={() => setSelectedWorkshop(workshop)}
                    disabled={isFull}
                    className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${isFull ? 'bg-muted-bg text-muted cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
                  >
                    Rezervasyon Yap
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {workshops.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted bg-muted-bg/30 rounded-lg border border-dashed border-border">
            Şu an planlanmış bir atölye bulunmuyor.
          </div>
        )}
      </div>

      {/* Rezervasyon ve Detay Modalı */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-scale-in">
            <h2 className="text-2xl font-serif font-bold text-secondary mb-2">Atölye Detayı & Rezervasyon</h2>
            <p className="text-sm text-muted mb-6">"{selectedWorkshop.title}" için detaylar ve değerlendirmeler.</p>
            
            <form onSubmit={handleReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Katılımcı Sayısı</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedWorkshop.capacity - selectedWorkshop.enrolled}
                  value={numParticipants}
                  onChange={(e) => setNumParticipants(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="bg-primary/5 p-4 rounded-sm border border-primary/20 flex justify-between items-center">
                <span className="font-medium text-secondary">Toplam Ücret:</span>
                <span className="text-xl font-bold text-primary">{(selectedWorkshop.price * numParticipants).toFixed(2)} TL</span>
              </div>

              {reservationStatus.startsWith('error') && (
                <div className="text-error text-sm bg-error/10 p-3 rounded-sm">{reservationStatus}</div>
              )}
              {reservationStatus === 'success' && (
                <div className="text-success text-sm bg-success/10 p-3 rounded-sm flex items-center gap-2">
                  <Ticket size={16} /> Rezervasyonunuz başarıyla oluşturuldu!
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setSelectedWorkshop(null); setReservationStatus(''); }}
                  className="flex-1 px-4 py-2 border border-border rounded-sm text-foreground/80 hover:bg-muted-bg transition-colors"
                >
                  Kapat
                </button>
                <button 
                  type="submit" 
                  disabled={reservationStatus === 'loading' || reservationStatus === 'success'}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary-dark transition-colors disabled:opacity-70"
                >
                  {reservationStatus === 'loading' ? 'İşleniyor...' : 'Onayla'}
                </button>
              </div>
            </form>

            {/* Yorumlar Bölümü */}
            <CommentsSection targetType="workshop" targetId={selectedWorkshop.id} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkshopsPage;
