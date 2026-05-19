import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, MessageSquare, Briefcase, Palette, ShoppingCart, Heart, Package, CheckCircle, Truck, XCircle, Clock } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [comments, setComments] = useState([]);
  const [commentReplyText, setCommentReplyText] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('');

  // Reservations State
  const [reservations, setReservations] = useState([]);
  const [editReservationModal, setEditReservationModal] = useState(null); // { id, num_participants, notes, status }
  const [editWorkshopModal, setEditWorkshopModal] = useState(null); // { id, title, instructor, category, price, ... }

  // Create Workshop States
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStatus, setAddStatus] = useState('');
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    instructor: '',
    category: 'Resim',
    price: '',
    capacity: 20,
    date: '',
    start_time: '10:00',
    end_time: '12:00',
    location: '',
    image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
    isFlexible: false
  });

  const fetchDashboardData = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/reports/dashboard`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/orders/all`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/support-tickets`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/comments`, { headers }).then(r => r.json()),
      fetch(`${API_URL}/reservations`, { headers }).then(r => r.json())
    ])
      .then(([statsData, ordersData, ticketsData, commentsData, reservationsData]) => {
        if (statsData.success) setStats(statsData.data);
        else setError('Veriler alınamadı.');

        if (ordersData.success) setOrders(ordersData.data);
        if (ticketsData.success) setTickets(ticketsData.data);
        if (commentsData?.success) setComments(commentsData.data);
        if (reservationsData?.success) setReservations(reservationsData.data);
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

    const token = localStorage.getItem('token');
    fetch(`${API_URL}/support-tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ admin_response: text, status: 'resolved' })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTickets(tickets.map(t => t.id === ticketId ? { ...t, admin_response: text, status: 'resolved' } : t));
          setReplyText(prev => ({ ...prev, [ticketId]: '' }));
          fetchDashboardData(); // Tüm istatistikleri ve KPI'ları yenile
        } else {
          alert(data.message || 'Hata oluştu');
        }
      });
  };

  const handleCommentReply = (commentId) => {
    const text = commentReplyText[commentId];
    if (!text) return;

    const token = localStorage.getItem('token');
    fetch(`${API_URL}/comments/${commentId}/reply`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ admin_reply: text })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setComments(comments.map(c => c.id === commentId ? { ...c, admin_reply: text } : c));
        setCommentReplyText(prev => ({...prev, [commentId]: ''}));
        alert('Yanıt başarıyla kaydedildi.');
      } else {
        alert(data.message || 'Hata oluştu');
      }
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          fetchDashboardData(); // Tüm istatistikleri ve sipariş durum çubuklarını yenile
        } else {
          alert(data.message || 'Hata oluştu');
        }
      });
  };

  const handleUpdateReservationStatus = (id, newStatus) => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/reservations/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReservations(reservations.map(r => r.id === id ? { ...r, status: newStatus } : r));
          fetchDashboardData();
        } else {
          alert(data.message || 'Hata oluştu');
        }
      });
  };

  const handleEditReservationSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let cleanNotes = editReservationModal.notes || '';
    cleanNotes = cleanNotes.replace(/\[Tercih Edilen Saat:\s*[^\]]+\]\s*/g, '').trim();
    let finalNotes = cleanNotes;
    if (editReservationModal.reservation_time) {
      finalNotes = `[Tercih Edilen Saat: ${editReservationModal.reservation_time}] ${cleanNotes}`.trim();
    }

    fetch(`${API_URL}/reservations/${editReservationModal.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        num_participants: parseInt(editReservationModal.num_participants),
        notes: finalNotes || null,
        status: editReservationModal.status,
        reservation_date: editReservationModal.reservation_date
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setEditReservationModal(null);
          fetchDashboardData();
        } else {
          alert(data.message || 'Güncelleme başarısız.');
        }
      });
  };

  const handleCreateWorkshop = async (e) => {
    e.preventDefault();
    setAddStatus('loading');
    const token = localStorage.getItem('token');
    
    let finalTitle = newWorkshop.title;
    if (newWorkshop.isFlexible && !finalTitle.includes('Seçilebilir')) {
      finalTitle = `${finalTitle} (Tarih/Saat Seçilebilir)`;
    }

    try {
      const response = await fetch(`${API_URL}/workshops`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: finalTitle,
          instructor: newWorkshop.instructor,
          category: newWorkshop.isFlexible ? 'Özel Ders' : newWorkshop.category,
          price: parseFloat(newWorkshop.price) || 0,
          capacity: parseInt(newWorkshop.capacity) || 20,
          date: newWorkshop.date,
          start_time: newWorkshop.start_time + ':00',
          end_time: newWorkshop.end_time + ':00',
          location: newWorkshop.location,
          image_url: newWorkshop.image_url,
          status: 'active'
        })
      });
      const data = await response.json();
      if (data.success) {
        setAddStatus('success');
        setNewWorkshop({
          title: '',
          instructor: '',
          category: 'Resim',
          price: '',
          capacity: 20,
          date: '',
          start_time: '10:00',
          end_time: '12:00',
          location: '',
          image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500',
          isFlexible: false
        });
        fetchDashboardData();
        setTimeout(() => {
          setShowAddForm(false);
          setAddStatus('');
        }, 1500);
      } else {
        setAddStatus('error: ' + (data.message || data.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      setAddStatus('error: Sunucu hatası');
    }
  };

  const handleEditWorkshopSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    let finalTitle = editWorkshopModal.title;
    if (editWorkshopModal.isFlexible) {
      if (!finalTitle.includes('Seçilebilir')) {
        finalTitle = `${finalTitle} (Tarih/Saat Seçilebilir)`;
      }
    } else {
      finalTitle = finalTitle.replace(/\s*\(Tarih\/Saat Seçilebilir\)/g, '');
    }

    try {
      const response = await fetch(`${API_URL}/workshops/${editWorkshopModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: finalTitle,
          instructor: editWorkshopModal.instructor,
          category: editWorkshopModal.isFlexible ? 'Özel Ders' : editWorkshopModal.category,
          price: parseFloat(editWorkshopModal.price) || 0,
          capacity: parseInt(editWorkshopModal.capacity) || 20,
          date: editWorkshopModal.date,
          start_time: editWorkshopModal.start_time.slice(0, 5) + ':00',
          end_time: editWorkshopModal.end_time.slice(0, 5) + ':00',
          location: editWorkshopModal.location,
          image_url: editWorkshopModal.image_url
        })
      });
      const data = await response.json();
      if (data.success) {
        setEditWorkshopModal(null);
        fetchDashboardData();
      } else {
        alert(data.message || 'Güncelleme başarısız.');
      }
    } catch (err) {
      alert('Sunucu hatası');
    }
  };

  const handleDeleteWorkshop = async (id) => {
    if (!window.confirm('Bu atölyeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/workshops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert(data.message || 'Silme işlemi başarısız.');
      }
    } catch (err) {
      alert('Sunucu hatası');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { label: 'Bekliyor', bg: 'bg-warning/10', text: 'text-warning', icon: <Clock size={12} /> },
      confirmed: { label: 'Onaylandı', bg: 'bg-info/10', text: 'text-info', icon: <CheckCircle size={12} /> },
      shipped: { label: 'Kargoda', bg: 'bg-primary/10', text: 'text-primary', icon: <Truck size={12} /> },
      delivered: { label: 'Teslim', bg: 'bg-success/10', text: 'text-success', icon: <CheckCircle size={12} /> },
      cancelled: { label: 'İptal', bg: 'bg-error/10', text: 'text-error', icon: <XCircle size={12} /> }
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
          { id: 'overview', label: 'Genel Bakış', icon: <BarChart3 size={16} /> },
          { id: 'orders', label: 'Sipariş Yönetimi', icon: <Package size={16} /> },
          { id: 'reservations', label: 'Rezervasyon Yönetimi', icon: <Users size={16} /> },
          { id: 'workshops', label: 'Raporlar', icon: <Briefcase size={16} /> },
          { id: 'tickets', label: 'Destek Talepleri', icon: <Ticket size={16} /> },
          { id: 'comments', label: 'Yorum Yönetimi', icon: <MessageSquare size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-foreground'
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
                className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${orderFilter === f.value ? 'bg-primary text-white' : 'bg-surface border border-border text-foreground/70 hover:border-primary'
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

      {/* ═══ Tab: Rezervasyon Yönetimi ═══ */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
              <h2 className="font-bold text-secondary">Atölye Rezervasyon Yönetimi</h2>
              <span className="text-xs font-medium bg-white px-2 py-1 rounded-sm border border-border">Toplam: {reservations.length} Rezervasyon</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-muted uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Kullanıcı</th>
                    <th className="px-4 py-3 font-medium">Atölye</th>
                    <th className="px-4 py-3 font-medium">Tarih</th>
                    <th className="px-4 py-3 font-medium">Katılımcı</th>
                    <th className="px-4 py-3 font-medium">Toplam Tutar</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservations.map(res => (
                    <tr key={res.id} className="hover:bg-muted-bg/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-muted">#{res.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{res.user?.name || `Kullanıcı #${res.user_id}`}</p>
                          <p className="text-xs text-muted">{res.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground line-clamp-1">{res.workshop?.title}</p>
                          <p className="text-xs text-muted">Eğitmen: {res.workshop?.instructor}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(res.reservation_date || res.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 font-medium">{res.num_participants} Kişi</td>
                      <td className="px-4 py-3 font-bold text-primary">{Number(res.total_price).toLocaleString('tr-TR')} ₺</td>
                      <td className="px-4 py-3">
                        {res.status === 'pending' ? (
                          <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-sm">Bekliyor</span>
                        ) : res.status === 'confirmed' ? (
                          <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-sm">Onaylandı</span>
                        ) : (
                          <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-sm">İptal Edildi</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              let chosenTime = '';
                              if (res.notes && res.notes.includes('[Tercih Edilen Saat:')) {
                                const match = res.notes.match(/\[Tercih Edilen Saat:\s*([^\]\s]+)\]/);
                                if (match && match[1]) chosenTime = match[1];
                              }
                              setEditReservationModal({
                                id: res.id,
                                num_participants: res.num_participants,
                                notes: res.notes || '',
                                status: res.status,
                                reservation_date: res.reservation_date || '',
                                reservation_time: chosenTime
                              });
                            }}
                            className="text-xs bg-muted-bg border border-border hover:bg-surface text-foreground/80 px-2.5 py-1.5 rounded-sm transition-colors"
                          >
                            Düzenle
                          </button>
                          {res.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'confirmed')}
                              className="text-xs bg-success text-white hover:bg-success-dark px-2.5 py-1.5 rounded-sm transition-colors font-medium"
                            >
                              Onayla
                            </button>
                          )}
                          {res.status !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'cancelled')}
                              className="text-xs bg-error text-white hover:bg-error-dark px-2.5 py-1.5 rounded-sm transition-colors font-medium"
                            >
                              İptal Et
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {reservations.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-muted">Henüz rezervasyon bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Raporlar (workshops) ═══ */}
      {activeTab === 'workshops' && (
        <div className="space-y-8 animate-fade-in">
          {/* Yeni Atölye Ekleme Formu */}
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-secondary text-lg">Atölye & Etkinlik Yönetimi</h2>
                <p className="text-xs text-muted">Sisteme yeni atölye veya kişiselleştirilmiş özel ders etkinliği ekleyin.</p>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded shadow hover:bg-primary-dark transition"
              >
                {showAddForm ? 'Kapat ✕' : '+ Yeni Atölye / Özel Ders Ekle'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateWorkshop} className="space-y-4 border-t border-border pt-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Atölye / Etkinlik Adı</label>
                    <input type="text" value={newWorkshop.title} onChange={e => setNewWorkshop({...newWorkshop, title: e.target.value})}
                      placeholder="Örn: Temel Yağlı Boya Eğitimi" className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Instructor */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Eğitmen</label>
                    <input type="text" value={newWorkshop.instructor} onChange={e => setNewWorkshop({...newWorkshop, instructor: e.target.value})}
                      placeholder="Örn: Ahmet Yılmaz" className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Kategori</label>
                    <select value={newWorkshop.category} onChange={e => setNewWorkshop({...newWorkshop, category: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded text-sm bg-background">
                      <option value="Resim">Resim</option>
                      <option value="Heykel">Heykel</option>
                      <option value="Seramik">Seramik</option>
                      <option value="Fotoğrafçılık">Fotoğrafçılık</option>
                      <option value="El Sanatları">El Sanatları</option>
                      <option value="Özel Ders">Özel Ders</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Fiyat (TL)</label>
                    <input type="number" min="0" value={newWorkshop.price} onChange={e => setNewWorkshop({...newWorkshop, price: e.target.value})}
                      placeholder="Örn: 450" className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Kapasite</label>
                    <input type="number" min="1" value={newWorkshop.capacity} onChange={e => setNewWorkshop({...newWorkshop, capacity: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Varsayılan Tarih</label>
                    <input type="date" value={newWorkshop.date} onChange={e => setNewWorkshop({...newWorkshop, date: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Başlangıç Saati</label>
                    <input type="time" value={newWorkshop.start_time} onChange={e => setNewWorkshop({...newWorkshop, start_time: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Bitiş Saati</label>
                    <input type="time" value={newWorkshop.end_time} onChange={e => setNewWorkshop({...newWorkshop, end_time: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Konum / Salon</label>
                    <input type="text" value={newWorkshop.location} onChange={e => setNewWorkshop({...newWorkshop, location: e.target.value})}
                      placeholder="Örn: Atölye A veya Zoom" className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-muted mb-1">Görsel URL</label>
                    <input type="text" value={newWorkshop.image_url} onChange={e => setNewWorkshop({...newWorkshop, image_url: e.target.value})}
                      placeholder="Görsel adresi" className="w-full px-3 py-2 border border-border rounded text-sm bg-background" required />
                  </div>

                  {/* isFlexible checkbox */}
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="isFlexible" checked={newWorkshop.isFlexible}
                      onChange={e => setNewWorkshop({...newWorkshop, isFlexible: e.target.checked})}
                      className="w-4 h-4 text-primary focus:ring-primary border-border rounded" />
                    <label htmlFor="isFlexible" className="text-xs font-bold text-primary select-none cursor-pointer">
                      💡 Kullanıcı Kendi Tarih/Saatini Seçebilsin (Kişiye Özel / Özel Ders)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <button type="submit" disabled={addStatus === 'loading'}
                    className="px-6 py-2.5 bg-secondary text-white text-sm font-semibold rounded hover:bg-secondary-dark transition disabled:opacity-50">
                    {addStatus === 'loading' ? 'Kaydediliyor...' : 'Atölyeyi Oluştur & Kaydet'}
                  </button>
                </div>

                {addStatus === 'success' && <p className="text-sm text-success font-medium">✅ Atölye başarıyla oluşturuldu!</p>}
                {addStatus.startsWith('error:') && <p className="text-sm text-error font-medium">❌ Hata: {addStatus.replace('error: ', '')}</p>}
              </form>
            )}
          </div>

          {/* Atölye İstatistikleri */}
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
              <h2 className="font-bold text-secondary text-base">Atölye & Etkinlik Performans Raporu</h2>
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
                    <th className="px-6 py-4 font-medium">Rezervasyon</th>
                    <th className="px-6 py-4 font-medium">Değerlendirme</th>
                    <th className="px-6 py-4 font-medium text-right">Eylemler</th>
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
                      <td className="px-6 py-4 font-medium text-foreground">{w.total_reservations || 0} Adet</td>
                      <td className="px-6 py-4 font-bold text-amber-500">⭐ {w.average_rating || '0.0'} / 5.0</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditWorkshopModal({
                              id: w.id,
                              title: w.title,
                              instructor: w.instructor,
                              category: w.category,
                              price: w.price,
                              capacity: w.capacity,
                              date: w.date,
                              start_time: w.start_time || '10:00',
                              end_time: w.end_time || '12:00',
                              location: w.location || '',
                              image_url: w.image_url || '',
                              isFlexible: w.title.includes('Seçilebilir')
                            })}
                            className="text-xs bg-muted-bg border border-border hover:bg-surface text-foreground/80 px-2.5 py-1.5 rounded-sm transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteWorkshop(w.id)}
                            className="text-xs bg-error text-white hover:bg-error-dark px-2.5 py-1.5 rounded-sm transition-colors font-medium"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {stats.workshops.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-muted">Sistemde henüz atölye bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Eser Performans Raporu */}
          <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
              <h2 className="font-bold text-secondary text-base">Sanat Eseri Performans Raporu</h2>
              <span className="text-xs font-medium bg-white px-2 py-1 rounded-sm border border-border">Toplam: {stats.artworks?.length || 0} Eser</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-muted uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Eser Başlığı</th>
                    <th className="px-6 py-4 font-medium">Sanatçı</th>
                    <th className="px-6 py-4 font-medium">Fiyat</th>
                    <th className="px-6 py-4 font-medium">Görüntülenme</th>
                    <th className="px-6 py-4 font-medium">Beğeni / Favori</th>
                    <th className="px-6 py-4 font-medium">Yorum Sayısı</th>
                    <th className="px-6 py-4 font-medium">Satış Adedi</th>
                    <th className="px-6 py-4 font-medium">Toplam Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.artworks?.map(a => (
                    <tr key={a.id} className="hover:bg-muted-bg/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{a.title}</td>
                      <td className="px-6 py-4 text-muted">{a.artist_name}</td>
                      <td className="px-6 py-4 font-medium">{Number(a.price).toLocaleString('tr-TR')} ₺</td>
                      <td className="px-6 py-4 text-primary">👁️ {a.views || 0}</td>
                      <td className="px-6 py-4 font-bold text-error">❤️ {a.total_likes || 0} Beğeni</td>
                      <td className="px-6 py-4 font-medium text-foreground">{a.total_comments || 0} Yorum</td>
                      <td className="px-6 py-4 font-medium text-foreground">{a.total_sold || 0} Adet</td>
                      <td className="px-6 py-4 font-bold text-success">+{Number(a.total_revenue || 0).toLocaleString('tr-TR')} ₺</td>
                    </tr>
                  ))}
                  {(!stats.artworks || stats.artworks.length === 0) && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-muted">Sistemde henüz eser bulunmuyor.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                        onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
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

      {/* ═══ Tab: Yorum Yönetimi ═══ */}
      {activeTab === 'comments' && (
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted-bg/50 flex justify-between items-center">
            <h2 className="font-bold text-secondary flex items-center gap-2"><MessageSquare className="text-primary" size={20} /> Kullanıcı Yorumları ve Değerlendirmeler</h2>
          </div>
          
          <div className="p-6 space-y-4">
            {comments.length === 0 ? (
               <div className="text-center text-muted py-8 bg-background rounded-lg border border-dashed border-border">Henüz sistemde yorum bulunmuyor.</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="border border-border rounded-lg p-5 bg-background shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-secondary">Kullanıcı #{comment.user_id}</h3>
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded uppercase font-medium">{comment.target_type === 'artwork' ? 'Eser' : 'Atölye'} #{comment.target_id}</span>
                      </div>
                      <p className="text-xs text-muted mt-1">{new Date(comment.created_at).toLocaleString('tr-TR')} • Puan: {comment.rating}/5</p>
                    </div>
                  </div>
                  <div className="bg-muted-bg/40 p-4 rounded-md mb-4 border border-border">
                    <p className="text-sm text-foreground/90">{comment.content}</p>
                  </div>
                  
                  {comment.admin_reply ? (
                    <div className="bg-primary/5 border-l-2 border-primary p-3 rounded mb-4">
                      <span className="text-xs font-bold text-primary uppercase block mb-1">Mevcut Yanıtınız:</span>
                      <p className="text-sm text-foreground/80">{comment.admin_reply}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-primary mb-1">{comment.admin_reply ? 'Yanıtı Güncelle' : 'Yorumu Yanıtla (Kullanıcı arayüzünde Yetkili Yanıtı olarak görünecek)'}</label>
                      <textarea 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none bg-surface"
                        rows="2"
                        placeholder="Yönetici veya etkinlik sorumlusu olarak yanıtınız..."
                        value={commentReplyText[comment.id] !== undefined ? commentReplyText[comment.id] : ''}
                        onChange={(e) => setCommentReplyText({...commentReplyText, [comment.id]: e.target.value})}
                      ></textarea>
                    </div>
                    <button 
                      onClick={() => handleCommentReply(comment.id)}
                      disabled={!commentReplyText[comment.id]}
                      className="bg-primary text-white px-5 py-2 h-[58px] rounded-md text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> {comment.admin_reply ? 'Güncelle' : 'Yanıtla'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* ─── Rezervasyon Düzenleme Modalı ─── */}
      {editReservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditReservationModal(null)}>
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-secondary mb-4">Rezervasyon Düzenle (#{editReservationModal.id})</h3>
            
            <form onSubmit={handleEditReservationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Katılımcı Sayısı</label>
                <input
                  type="number"
                  min="1"
                  value={editReservationModal.num_participants}
                  onChange={e => setEditReservationModal(p => ({ ...p, num_participants: parseInt(e.target.value) || 1 }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Durum</label>
                <select
                  value={editReservationModal.status}
                  onChange={e => setEditReservationModal(p => ({ ...p, status: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Rezervasyon Tarihi (Kişiye Özel)</label>
                <input
                  type="date"
                  value={editReservationModal.reservation_date || ''}
                  onChange={e => setEditReservationModal(p => ({ ...p, reservation_date: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Rezervasyon Saati (Kişiye Özel)</label>
                <input
                  type="time"
                  value={editReservationModal.reservation_time || ''}
                  onChange={e => setEditReservationModal(p => ({ ...p, reservation_time: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Notlar / Kupon Detayları</label>
                <textarea
                  rows="3"
                  value={editReservationModal.notes}
                  onChange={e => setEditReservationModal(p => ({ ...p, notes: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditReservationModal(null)} className="flex-1 py-2 border border-border rounded text-sm font-medium hover:bg-muted-bg transition-colors">
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Atölye Düzenleme Modalı ─── */}
      {editWorkshopModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditWorkshopModal(null)}>
          <div className="bg-surface rounded-lg border border-border p-6 w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-serif font-bold text-secondary mb-4">Atölye / Etkinlik Düzenle (#{editWorkshopModal.id})</h3>
            
            <form onSubmit={handleEditWorkshopSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Atölye Adı</label>
                  <input
                    type="text"
                    value={editWorkshopModal.title}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, title: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Eğitmen</label>
                  <input
                    type="text"
                    value={editWorkshopModal.instructor}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, instructor: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Kategori</label>
                  <select
                    value={editWorkshopModal.category}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, category: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    disabled={editWorkshopModal.isFlexible}
                  >
                    <option value="Resim">Resim</option>
                    <option value="Heykel">Heykel</option>
                    <option value="Seramik">Seramik</option>
                    <option value="Fotoğrafçılık">Fotoğrafçılık</option>
                    <option value="El Sanatları">El Sanatları</option>
                    <option value="Özel Ders">Özel Ders</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Fiyat (TL)</label>
                  <input
                    type="number"
                    min="0"
                    value={editWorkshopModal.price}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, price: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Kontenjan (Kapasite)</label>
                  <input
                    type="number"
                    min="1"
                    value={editWorkshopModal.capacity}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, capacity: parseInt(e.target.value) || 20 }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Etkinlik Tarihi</label>
                  <input
                    type="date"
                    value={editWorkshopModal.date}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, date: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={editWorkshopModal.start_time.slice(0, 5)}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Bitiş Saati</label>
                  <input
                    type="time"
                    value={editWorkshopModal.end_time.slice(0, 5)}
                    onChange={e => setEditWorkshopModal(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Konum / Adres</label>
                <input
                  type="text"
                  value={editWorkshopModal.location}
                  onChange={e => setEditWorkshopModal(p => ({ ...p, location: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Görsel URL</label>
                <input
                  type="text"
                  value={editWorkshopModal.image_url}
                  onChange={e => setEditWorkshopModal(p => ({ ...p, image_url: e.target.value }))}
                  className="w-full p-2.5 border border-border rounded bg-background text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 pb-1">
                <input
                  type="checkbox"
                  id="edit-is-flexible"
                  checked={editWorkshopModal.isFlexible}
                  onChange={e => setEditWorkshopModal(p => ({ ...p, isFlexible: e.target.checked }))}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="edit-is-flexible" className="text-xs font-semibold text-foreground/80 cursor-pointer">
                  Kullanıcı Kendi Tarih/Saatini Seçebilsin (Kişiye Özel / Özel Ders)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditWorkshopModal(null)} className="flex-1 py-2 border border-border rounded text-sm font-medium hover:bg-muted-bg transition-colors">
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
