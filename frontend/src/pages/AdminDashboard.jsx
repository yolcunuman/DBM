import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, MessageSquare, Briefcase, Palette, ShoppingCart, Heart, Package, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('');

  const fetchDashboardData = () => {
    Promise.all([
      fetch(`${API_URL}/reports/dashboard`).then(r => r.json()),
      fetch(`${API_URL}/orders/all`).then(r => r.json()),
      fetch(`${API_URL}/support-tickets`).then(r => r.json())
    ])
      .then(([statsData, ordersData, ticketsData]) => {
        if (statsData.success) setStats(statsData.data);
        else setError('Veriler alınamadı.');
        
        if (ordersData.success) setOrders(ordersData.data);
        if (ticketsData.success) setTickets(ticketsData.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Sunucu bağlantı hatası.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleReply = (ticketId) => {
    const text = replyText[ticketId];
    if (!text) return;

    fetch(`${API_URL}/support-tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_response: text, status: 'resolved' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setTickets(tickets.map(t => t.id === ticketId ? { ...t, admin_response: text, status: 'resolved' } : t));
        setReplyText(prev => ({...prev, [ticketId]: ''}));
        fetchDashboardData(); // Tüm istatistikleri ve KPI'ları yenile
      }
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          fetchDashboardData(); // Tüm istatistikleri ve sipariş durum çubuklarını yenile
        }
      });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Bekliyor', bg: 'bg-warning/10', text: 'text-warning', icon: <Clock size={12}/> },
      confirmed: { label: 'Onaylandı', bg: 'bg-info/10', text: 'text-info', icon: <CheckCircle size={12}/> },
      shipped: { label: 'Kargoda', bg: 'bg-primary/10', text: 'text-primary', icon: <Truck size={12}/> },
      delivered: { label: 'Teslim', bg: 'bg-success/10', text: 'text-success', icon: <CheckCircle size={12}/> },
      cancelled: { label: 'İptal', bg: 'bg-error/10', text: 'text-error', icon: <XCircle size={12}/> }
    };
    const s = map[status] || map.pending;
    return <span className={`inline-flex items-center gap-1 ${s.bg} ${s.text} px-2 py-1 rounded-sm text-xs font-bold`}>{s.icon} {s.label}</span>;
  };

  if (loading) return <div className="text-center py-20 text-muted">Yükleniyor...</div>;
  if (error) return <div className="text-center py-20 text-error">{error}</div>;
  if (!stats) return null;

  const kpi = stats.kpi;
  const filteredOrders = orderFilter ? orders.filter(o => o.status === orderFilter) : orders;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary flex items-center gap-2">
          <BarChart3 className="text-primary" /> Yönetici Paneli
        </h1>
        <p className="text-muted mt-2">Platformun genel durumu, eser satışları, sipariş ve destek yönetimi.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted-bg p-1 rounded-lg flex-wrap">
        {[
          { id: 'overview', label: 'Genel Bakış', icon: <BarChart3 size={16}/> },
          { id: 'orders', label: 'Sipariş Yönetimi', icon: <Package size={16}/> },
          { id: 'workshops', label: 'Atölye Raporu', icon: <Briefcase size={16}/> },
          { id: 'tickets', label: 'Destek Talepleri', icon: <Ticket size={16}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Genel Bakış ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Kartları - Satır 1: Eser & Satış */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Toplam Eser</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.total_artworks || 0}</h3>
                  <p className="text-xs text-muted mt-1">{kpi.available_artworks || 0} satışta</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <Palette size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Toplam Sipariş</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.total_orders || 0}</h3>
                  <p className="text-xs text-muted mt-1">{kpi.pending_orders || 0} bekliyor</p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center text-success">
                  <ShoppingCart size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Satış Geliri</p>
                  <h3 className="text-2xl font-bold text-secondary">{(kpi.total_sales_revenue || 0).toLocaleString('tr-TR')} ₺</h3>
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                  <BarChart3 size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-error">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Favoriler</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.total_favorites || 0}</h3>
                </div>
                <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center text-error">
                  <Heart size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Kartları - Satır 2: Atölye & Destek */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-info">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Toplam Rezervasyon</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.total_enrolled}</h3>
                </div>
                <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center text-info">
                  <Users size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Ortalama Doluluk</p>
                  <h3 className="text-2xl font-bold text-secondary">%{kpi.average_occupancy}</h3>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                  <Briefcase size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Açık Destek Talebi</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.open_tickets}</h3>
                </div>
                <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center text-warning">
                  <Ticket size={20} />
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border p-5 rounded-lg shadow-sm border-l-4 border-l-primary-light">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted font-medium mb-1">Toplam Yorum</p>
                  <h3 className="text-2xl font-bold text-secondary">{kpi.total_comments}</h3>
                </div>
                <div className="w-10 h-10 bg-primary-light/10 rounded-full flex items-center justify-center text-primary-light">
                  <MessageSquare size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Sipariş Durumu Özet Çubukları */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h2 className="font-bold text-secondary mb-4">Sipariş Durumu Dağılımı</h2>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Bekliyor', count: kpi.pending_orders, color: 'bg-warning' },
                { label: 'Onaylandı', count: kpi.confirmed_orders, color: 'bg-info' },
                { label: 'Kargoda', count: kpi.shipped_orders, color: 'bg-primary' },
                { label: 'Teslim', count: kpi.delivered_orders, color: 'bg-success' },
                { label: 'İptal', count: kpi.cancelled_orders, color: 'bg-error' }
              ].map(item => (
                <div key={item.label} className="text-center">
                  <div className="h-24 bg-muted-bg rounded-lg flex items-end justify-center p-2 mb-2">
                    <div 
                      className={`w-full ${item.color} rounded-t-md transition-all`}
                      style={{ height: `${kpi.total_orders > 0 ? Math.max(((item.count || 0) / kpi.total_orders) * 100, 5) : 5}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-lg font-bold text-secondary">{item.count || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Sipariş Yönetimi ═══ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Filtreler */}
          <div className="flex gap-2 flex-wrap">
            {[
              { value: '', label: 'Tümü' },
              { value: 'pending', label: 'Bekleyen' },
              { value: 'confirmed', label: 'Onaylanan' },
              { value: 'shipped', label: 'Kargoda' },
              { value: 'delivered', label: 'Teslim' },
              { value: 'cancelled', label: 'İptal' }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setOrderFilter(f.value)}
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                  orderFilter === f.value ? 'bg-primary text-white' : 'bg-surface border border-border text-foreground/70 hover:border-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sipariş Tablosu */}
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-muted uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Eser</th>
                    <th className="px-4 py-3 font-medium">Tutar</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                    <th className="px-4 py-3 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted-bg/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-muted">#{order.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted-bg overflow-hidden flex-shrink-0">
                            {order.artwork?.image_url ? (
                              <img src={order.artwork.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Palette size={14} className="text-muted" /></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{order.artwork?.title || 'Eser'}</p>
                            <p className="text-xs text-muted">{order.artwork?.artist_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold">{Number(order.total_price).toLocaleString('tr-TR')} ₺</td>
                      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-3 text-muted text-xs">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs border border-border rounded-sm px-2 py-1.5 bg-background focus:outline-none focus:border-primary"
                        >
                          <option value="pending">Bekliyor</option>
                          <option value="confirmed">Onayla</option>
                          <option value="shipped">Kargoya Ver</option>
                          <option value="delivered">Teslim Edildi</option>
                          <option value="cancelled">İptal Et</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-muted">Bu filtreye uygun sipariş bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Atölye Raporu ═══ */}
      {activeTab === 'workshops' && (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
            <h2 className="font-bold text-secondary">Atölye Doluluk Raporu</h2>
            <span className="text-xs font-medium bg-white px-2 py-1 rounded-sm border border-border">Toplam: {kpi.total_workshops} Atölye</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-muted uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Atölye Adı</th>
                  <th className="px-6 py-4 font-medium">Kapasite</th>
                  <th className="px-6 py-4 font-medium">Kayıtlı</th>
                  <th className="px-6 py-4 font-medium">Doluluk Oranı</th>
                  <th className="px-6 py-4 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.workshops.map(w => (
                  <tr key={w.id} className="hover:bg-muted-bg/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{w.title}</td>
                    <td className="px-6 py-4 text-muted">{w.capacity} Kişi</td>
                    <td className="px-6 py-4 font-medium">{w.enrolled} Kişi</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-12">{w.occupancy_rate}%</span>
                        <div className="w-24 h-2 bg-muted-bg rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${w.occupancy_rate >= 100 ? 'bg-error' : w.occupancy_rate > 70 ? 'bg-success' : 'bg-primary'}`} 
                            style={{ width: `${Math.min(w.occupancy_rate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {w.occupancy_rate >= 100 ? (
                        <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-sm">Dolu</span>
                      ) : w.occupancy_rate > 70 ? (
                        <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-sm">Popüler</span>
                      ) : (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-sm">Müsait</span>
                      )}
                    </td>
                  </tr>
                ))}
                {stats.workshops.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-muted">Sistemde henüz atölye bulunmuyor.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Tab: Destek Talepleri ═══ */}
      {activeTab === 'tickets' && (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
            <h2 className="font-bold text-secondary flex items-center gap-2"><Ticket className="text-warning" size={20} /> Bekleyen Destek Talepleri</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length === 0 ? (
               <div className="text-center text-muted py-8 bg-background rounded-lg border border-dashed border-border">Bekleyen destek talebi bulunmuyor. 🎉</div>
            ) : (
              tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').map(ticket => (
                <div key={ticket.id} className="border border-border rounded-lg p-5 bg-background shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-secondary">#{ticket.id} - {ticket.subject}</h3>
                      <p className="text-xs text-muted mt-1">{new Date(ticket.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                    <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-1 rounded-sm uppercase">{ticket.category}</span>
                  </div>
                  <div className="bg-muted-bg/40 p-4 rounded-md mb-4 border border-border">
                    <p className="text-sm text-foreground/90">{ticket.message}</p>
                  </div>
                  
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-primary mb-1">Müşteriye Yanıtınız (Talebi Çözüldü Olarak İşaretler)</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none bg-surface"
                        rows="2"
                        placeholder="Buraya yazacağınız yanıt müşterinin iletişim sayfasında görünecektir..."
                        value={replyText[ticket.id] || ''}
                        onChange={(e) => setReplyText({...replyText, [ticket.id]: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      onClick={() => handleReply(ticket.id)}
                      disabled={!replyText[ticket.id]}
                      className="bg-primary text-white px-5 py-2 h-[58px] rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Yanıtla
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
