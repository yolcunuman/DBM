import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Clock, CheckCircle, AlertCircle, LifeBuoy } from 'lucide-react';

const ContactPage = () => {
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({ subject: '', category: 'general', message: '' });
  const [submitStatus, setSubmitStatus] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Backend'den geçmiş talepleri çek
  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, []);

  const fetchTickets = () => {
    fetch(`http://localhost:5001/api/support-tickets?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTickets(data.data);
        }
      })
      .catch(err => console.error('Tickets fetch error:', err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('loading');

    fetch('http://localhost:5001/api/support-tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, user_id: user ? user.id : null })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSubmitStatus('success');
          setFormData({ subject: '', category: 'general', message: '' });
          fetchTickets(); // Listeyi yenile
          setTimeout(() => setSubmitStatus(''), 3000);
        } else {
          setSubmitStatus('error');
        }
      })
      .catch(() => setSubmitStatus('error'));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return <span className="bg-info/10 text-info px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> Açık</span>;
      case 'in_progress': return <span className="bg-warning/10 text-warning px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1"><Clock size={12}/> İşleniyor</span>;
      case 'resolved': return <span className="bg-success/10 text-success px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Çözüldü</span>;
      default: return <span className="bg-muted-bg text-muted px-2 py-1 rounded-sm text-xs font-bold">Kapalı</span>;
    }
  };

  const getStatusProgress = (status) => {
    const steps = [
      { id: 'open', label: 'İletildi', color: 'bg-info', activeColor: 'text-info' },
      { id: 'in_progress', label: 'İşleniyor', color: 'bg-warning', activeColor: 'text-warning' },
      { id: 'resolved', label: 'Çözüldü', color: 'bg-success', activeColor: 'text-success' }
    ];
    
    let currentIndex = 0;
    if (status === 'in_progress') currentIndex = 1;
    if (status === 'resolved' || status === 'closed') currentIndex = 2;

    return (
      <div className="mt-6 mb-2 bg-background p-4 rounded-lg border border-border shadow-inner">
        <h4 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">Talep Durumu</h4>
        <div className="flex justify-between mb-2">
          {steps.map((step, idx) => (
            <span key={step.id} className={`text-[10px] font-bold uppercase transition-colors ${idx <= currentIndex ? step.activeColor : 'text-muted/50'}`}>
              {step.label}
            </span>
          ))}
        </div>
        <div className="flex gap-1 h-2 w-full bg-muted-bg rounded-full overflow-hidden">
          {steps.map((step, idx) => (
            <div key={step.id} className={`h-full flex-1 transition-all duration-700 ${idx <= currentIndex ? step.color : 'bg-transparent'}`}></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-secondary">İletişim & Destek</h1>
        <p className="text-muted max-w-2xl mx-auto">Sorularınız veya karşılaştığınız sorunlar için bizimle iletişime geçin. Ekibimiz en kısa sürede size dönüş yapacaktır.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Destek Formu */}
        <div className="bg-surface border border-border p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-serif font-bold text-secondary mb-6 flex items-center gap-2">
            <MessageSquare className="text-primary" /> Yeni Destek Talebi
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Konu Başlığı</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kategori</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary bg-background"
              >
                <option value="general">Genel Soru</option>
                <option value="order">Sipariş & Eserler</option>
                <option value="reservation">Atölye & Rezervasyon</option>
                <option value="technical">Teknik Sorun</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mesajınız</label>
              <textarea 
                rows="5"
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-2 border border-border rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-background resize-none"
                required
              ></textarea>
            </div>

            {submitStatus === 'success' && (
              <div className="text-success text-sm bg-success/10 p-3 rounded-sm border border-success/20">
                Talebiniz başarıyla iletildi. Ekibimiz en kısa sürede dönüş yapacaktır.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="text-error text-sm bg-error/10 p-3 rounded-sm border border-error/20">
                Bir hata oluştu. Lütfen daha sonra tekrar deneyin.
              </div>
            )}

            <button 
              type="submit" 
              disabled={submitStatus === 'loading'}
              className="w-full py-3 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Send size={18} /> {submitStatus === 'loading' ? 'Gönderiliyor...' : 'Talebi Gönder'}
            </button>
          </form>
        </div>

        {/* Geçmiş Talepler */}
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-bold text-secondary">Geçmiş Talepleriniz</h2>
          
          <div className="space-y-4">
            {!user ? (
              <div className="text-muted bg-muted-bg/50 p-6 rounded-lg text-center border border-dashed border-border">
                Geçmiş taleplerinizi görmek için <a href="/login" className="text-primary hover:underline">giriş yapmalısınız</a>.
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-muted bg-muted-bg/50 p-6 rounded-lg text-center border border-dashed border-border">
                Henüz bir destek talebi oluşturmadınız.
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="bg-surface border border-border p-5 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-secondary line-clamp-1">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{ticket.message}</p>
                  
                  {getStatusProgress(ticket.status)}
                  
                  {ticket.admin_response && (
                    <div className="bg-muted-bg p-4 rounded-lg text-sm border-l-4 border-primary mt-4 flex gap-3">
                      <LifeBuoy className="text-primary shrink-0" size={20} />
                      <div>
                        <strong className="text-primary block mb-1">Müşteri Temsilcisi Yanıtı:</strong>
                        <p className="text-foreground">{ticket.admin_response}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted pt-4 mt-4 border-t border-border">
                    <span className="uppercase tracking-wider font-medium">Talep No: #{ticket.id} • {ticket.category}</span>
                    <span className="font-medium">{new Date(ticket.createdAt || ticket.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
