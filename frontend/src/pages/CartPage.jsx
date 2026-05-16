import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, CreditCard, Truck, Palette, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5001/api';

const CartPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch(`${API_URL}/orders?user_id=1`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { label: 'Onay Bekliyor', color: 'warning', icon: <ShoppingCart size={14} /> };
      case 'confirmed': return { label: 'Onaylandı', color: 'info', icon: <CheckCircle size={14} /> };
      case 'shipped': return { label: 'Kargoda', color: 'primary', icon: <Truck size={14} /> };
      case 'delivered': return { label: 'Teslim Edildi', color: 'success', icon: <CheckCircle size={14} /> };
      case 'cancelled': return { label: 'İptal Edildi', color: 'error', icon: <Trash2 size={14} /> };
      default: return { label: status, color: 'muted', icon: null };
    }
  };

  const totalAmount = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_price), 0);

  if (loading) return <div className="text-center py-20 text-muted">Siparişler yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-secondary flex items-center justify-center gap-3">
          <ShoppingCart className="text-primary" /> Siparişlerim
        </h1>
        <p className="text-muted">Satın aldığınız eserlerin durumunu buradan takip edebilirsiniz.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-muted-bg/30 rounded-lg border border-dashed border-border space-y-4">
          <ShoppingCart size={48} className="mx-auto text-muted-light" />
          <p className="text-muted text-lg">Henüz bir siparişiniz bulunmuyor.</p>
          <a href="/artworks" className="inline-block px-6 py-2.5 bg-primary text-white rounded-sm font-medium hover:bg-primary-dark transition-colors">
            Eserleri Keşfet
          </a>
        </div>
      ) : (
        <>
          {/* Özet */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Toplam Sipariş: <strong className="text-foreground">{orders.length}</strong></p>
              <p className="text-sm text-muted mt-1">Aktif Sipariş: <strong className="text-foreground">{orders.filter(o => o.status !== 'cancelled').length}</strong></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Toplam Tutar</p>
              <p className="text-3xl font-bold text-secondary">{totalAmount.toLocaleString('tr-TR')} ₺</p>
            </div>
          </div>

          {/* Sipariş Listesi */}
          <div className="space-y-4">
            {orders.map(order => {
              const artwork = order.artwork;
              const statusInfo = getStatusInfo(order.status);

              return (
                <div key={order.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Görsel */}
                    <div className="w-full sm:w-36 h-36 bg-muted-bg flex-shrink-0">
                      {artwork?.image_url ? (
                        <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Palette size={28} className="text-primary-light opacity-40" /></div>
                      )}
                    </div>

                    {/* Bilgiler */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-secondary">{artwork?.title || 'Eser'}</h3>
                          <p className="text-sm text-primary-light">{artwork?.artist_name}</p>
                          <p className="text-xs text-muted mt-1">Sipariş #{order.id} • {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-secondary">{Number(order.total_price).toLocaleString('tr-TR')} ₺</div>
                          <span className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-1 rounded-sm bg-${statusInfo.color}/10 text-${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border text-xs text-muted">
                        <span className="flex items-center gap-1"><CreditCard size={14} /> {order.payment_method === 'credit_card' ? 'Kredi Kartı' : order.payment_method}</span>
                        <span>Adet: {order.quantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
