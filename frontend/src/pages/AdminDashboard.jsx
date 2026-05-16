import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, MessageSquare, Briefcase, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/reports/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.data);
        } else {
          setError('Veriler alınamadı.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard fetch error:', err);
        setError('Sunucu bağlantı hatası.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20 text-muted">Yükleniyor...</div>;
  if (error) return <div className="text-center py-20 text-error">{error}</div>;
  if (!stats) return null;

  const kpi = stats.kpi;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary flex items-center gap-2">
          <BarChart3 className="text-primary" /> Yönetici Özeti (Geliştirici 2)
        </h1>
        <p className="text-muted mt-2">Platformun genel durumu, atölye doluluk oranları ve etkileşim raporları.</p>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted font-medium mb-1">Toplam Rezervasyon</p>
              <h3 className="text-3xl font-bold text-secondary">{kpi.total_enrolled}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted font-medium mb-1">Ortalama Doluluk</p>
              <h3 className="text-3xl font-bold text-secondary">%{kpi.average_occupancy}</h3>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center text-success">
              <Briefcase size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm border-l-4 border-l-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted font-medium mb-1">Bekleyen Destek Talebi</p>
              <h3 className="text-3xl font-bold text-secondary">{kpi.open_tickets}</h3>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center text-warning">
              <Ticket size={24} />
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm border-l-4 border-l-info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted font-medium mb-1">Toplam Yorum</p>
              <h3 className="text-3xl font-bold text-secondary">{kpi.total_comments}</h3>
            </div>
            <div className="w-12 h-12 bg-info/10 rounded-full flex items-center justify-center text-info">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Atölye Detay Tablosu */}
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
    </div>
  );
};

export default AdminDashboard;
