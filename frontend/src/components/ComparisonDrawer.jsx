import React, { useState, useEffect } from 'react';
import { Scale, X, Trash2, Calendar, Users, MapPin } from 'lucide-react';

const analyzeComparisons = (items, type) => {
  if (!items || items.length < 2) return null;

  const validItems = items.filter(Boolean);
  
  if (type === 'artwork') {
    const prices = validItems.map(i => Number(i.price) || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const cheapest = validItems.find(i => (Number(i.price) || 0) === minPrice);
    const premium = validItems.find(i => (Number(i.price) || 0) === maxPrice);
    
    const years = validItems.map(i => parseInt(i.year) || 0).filter(y => y > 0);
    let newest = null;
    if (years.length > 0) {
      const maxYear = Math.max(...years);
      newest = validItems.find(i => (parseInt(i.year) || 0) === maxYear);
    }
    
    const parseArea = (dimStr) => {
      if (!dimStr) return 0;
      const parts = dimStr.toLowerCase().match(/(\d+)\s*(x|\*)\s*(\d+)/);
      if (parts && parts[1] && parts[3]) {
        return parseInt(parts[1]) * parseInt(parts[3]);
      }
      return 0;
    };
    const dimensions = validItems.map(i => parseArea(i.dimensions));
    const maxArea = Math.max(...dimensions);
    const largest = maxArea > 0 ? validItems.find(i => parseArea(i.dimensions) === maxArea) : null;

    let bulletPoints = [];
    bulletPoints.push(`💵 **En Uygun Fiyat:** "${cheapest.title}" (${minPrice.toLocaleString('tr-TR')} ₺) bütçe dostu bir sanat yatırımı seçeneğidir.`);
    if (premium && premium.id !== cheapest.id) {
      bulletPoints.push(`💎 **En Değerli Eser:** "${premium.title}" (${maxPrice.toLocaleString('tr-TR')} ₺) koleksiyon değeri en yüksek eserdir.`);
    }
    if (largest) {
      bulletPoints.push(`📐 **En Büyük Boyut:** "${largest.title}" (${largest.dimensions}) sergi alanı açısından en görkemli seçenektir.`);
    }
    if (newest) {
      bulletPoints.push(`🎨 **En Güncel Çalışma:** "${newest.title}" (${newest.year || 'Yakın Dönem'}) sanatçının en güncel tarzını yansıtmaktadır.`);
    }

    let recommendation = `**Tavsiye:** Bütçenizi ön plande tutuyorsanız **${cheapest.title}** harika bir başlangıçtır. Ancak duvarınızda geniş ve iddialı bir odak noktası yaratmak istiyorsanız ${largest ? `**${largest.title}**` : `**${premium.title}**`} seçeneğini değerlendirmelisiniz.`;

    return {
      title: 'Sanat Eseri Karşılaştırma Sonuç Analizi',
      bulletPoints,
      recommendation
    };
  } else {
    const prices = validItems.map(i => Number(i.price) || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const cheapest = validItems.find(i => (Number(i.price) || 0) === minPrice);
    const premium = validItems.find(i => (Number(i.price) || 0) === maxPrice);

    const spots = validItems.map(i => (i.capacity - i.enrolled) || 0);
    const maxSpots = Math.max(...spots);
    const mostAvailable = validItems.find(i => ((i.capacity - i.enrolled) || 0) === maxSpots);

    const dates = validItems.map(i => new Date(i.date).getTime()).filter(t => !isNaN(t));
    let soonest = null;
    if (dates.length > 0) {
      const minDate = Math.min(...dates);
      soonest = validItems.find(i => new Date(i.date).getTime() === minDate);
    }

    let bulletPoints = [];
    bulletPoints.push(`💵 **En Uygun Fiyat:** "${cheapest.title}" (${minPrice.toLocaleString('tr-TR')} ₺) ile en ekonomik atölye eğitimidir.`);
    if (mostAvailable) {
      const avail = mostAvailable.capacity - mostAvailable.enrolled;
      bulletPoints.push(`👥 **En Müsait Kontenjan:** "${mostAvailable.title}" (${avail} boş yer) grup katılımı için en uygun seçenektir.`);
    }
    if (soonest) {
      const dateStr = new Date(soonest.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      bulletPoints.push(`📅 **İlk Başlayacak Etkinlik:** "${soonest.title}" (${dateStr}) takvimde en yakın tarihli atölyedir.`);
    }

    let recommendation = `**Tavsiye:** Hemen başlayıp bütçenizi yormayacak bir eğitim istiyorsanız **${cheapest.title}** sizin için idealdir. ${mostAvailable && mostAvailable.id !== cheapest.id ? `Arkadaşlarınızla birlikte katılım planlıyorsanız geniş kontenjana sahip **${mostAvailable.title}** tercih edilebilir.` : ''}`;

    return {
      title: 'Atölye & Etkinlik Karşılaştırma Sonuç Analizi',
      bulletPoints,
      recommendation
    };
  }
};

const ComparisonDrawer = () => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadItems = () => {
    try {
      const stored = localStorage.getItem('galerist_compare');
      setItems(stored ? JSON.parse(stored) : []);
    } catch (e) {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('galerist-compare-updated', loadItems);
    window.addEventListener('galerist-compare-open', handleOpen);
    return () => {
      window.removeEventListener('galerist-compare-updated', loadItems);
      window.removeEventListener('galerist-compare-open', handleOpen);
    };
  }, []);

  const handleRemove = (id) => {
    const updated = items.filter(item => item.id !== id);
    localStorage.setItem('galerist_compare', JSON.stringify(updated));
    setItems(updated);
    window.dispatchEvent(new Event('galerist-compare-updated'));
  };

  const handleClear = () => {
    localStorage.removeItem('galerist_compare');
    setItems([]);
    window.dispatchEvent(new Event('galerist-compare-updated'));
  };

  const handleSaveComparison = () => {
    if (items.length === 0) return;
    
    const activeTitle = `${itemType === 'artwork' ? 'Eser' : 'Atölye'} Karşılaştırması - ${new Date().toLocaleDateString('tr-TR')}`;
    const analysisObj = analyzeComparisons(items, itemType);
    
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : 'guest';
    
    try {
      const stored = localStorage.getItem(`galerist_saved_comparisons_${userId}`);
      const savedComparisons = stored ? JSON.parse(stored) : [];
      
      const newSave = {
        id: Date.now(),
        title: activeTitle,
        type: itemType,
        items: items,
        analysis: analysisObj,
        date: new Date().toISOString()
      };
      
      savedComparisons.unshift(newSave);
      localStorage.setItem(`galerist_saved_comparisons_${userId}`, JSON.stringify(savedComparisons));
      
      showToast("Karşılaştırma sonuçları başarıyla kaydedildi! Profilinizdeki 'Karşılaştırmalarım' sekmesinden dilediğiniz zaman erişebilirsiniz.");
      window.dispatchEvent(new Event('galerist-saved-comparisons-updated'));
    } catch (e) {
      console.error(e);
      showToast("Karşılaştırma kaydedilirken bir hata oluştu.", "error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (items.length === 0) return null;

  const itemType = items[0]?.type || 'artwork';
  const analysis = analyzeComparisons(items, itemType);

  return (
    <>
      {/* Floating Bottom Bar (Glassmorphism style) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface/85 backdrop-blur-md border border-primary/20 px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-slide-up max-w-[90%] md:max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Scale size={20} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-secondary text-sm md:text-base">Karşılaştırma Listesi</h4>
            <p className="text-xs text-muted font-medium">{items.length} {itemType === 'artwork' ? 'Eser' : 'Atölye'} seçildi</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md"
          >
            Karşılaştır
          </button>
          <button
            onClick={handleClear}
            className="bg-muted-bg border border-border text-foreground hover:bg-surface px-4 py-2 rounded-full text-xs font-bold transition-all"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Comparison Overlay Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div
            className="bg-surface rounded-xl border border-border max-w-5xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl animate-scale-in relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-muted-bg hover:bg-border border border-border rounded-full flex items-center justify-center transition-colors text-foreground"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border pb-4 pr-12">
              <h3 className="text-2xl font-serif font-bold text-secondary flex items-center gap-2">
                <Scale className="text-primary" /> {itemType === 'artwork' ? 'Sanat Eseri Karşılaştırma' : 'Atölye Karşılaştırma'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveComparison}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                >
                  💾 Sonuçları Kaydet
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white text-xs font-bold py-2 px-4 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                >
                  🖨️ PDF / Yazdır
                </button>
              </div>
            </div>

            {/* Side-by-Side Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map(item => (
                <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-background/50 flex flex-col relative">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 z-10 bg-error/90 hover:bg-error text-white p-2 rounded-full shadow-md transition-colors"
                    title="Kaldır"
                  >
                    <Trash2 size={14} />
                  </button>

                  {/* Image */}
                  <div className="h-44 bg-muted-bg relative">
                    <img
                      src={item.image_url || item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">
                        {item.category}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-secondary mt-2 leading-tight">{item.title}</h4>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {itemType === 'artwork' ? item.artist_name : `Eğitmen: ${item.instructor}`}
                      </p>
                    </div>

                    {/* Specifications */}
                    <div className="border-t border-border pt-4 space-y-2 text-xs">
                      {itemType === 'artwork' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted">Teknik:</span>
                            <span className="font-semibold text-right">{item.technique || 'Belirtilmedi'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Boyutlar:</span>
                            <span className="font-semibold text-right">{item.dimensions || 'Belirtilmedi'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Yıl:</span>
                            <span className="font-semibold text-right">{item.year || 'Belirtilmedi'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-muted flex items-center gap-1"><Calendar size={12} /> Tarih:</span>
                            <span className="font-semibold text-right">
                              {new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted flex items-center gap-1"><Users size={12} /> Kapasite:</span>
                            <span className="font-semibold text-right">
                              {item.capacity} Kişi ({item.capacity - item.enrolled} Boş Yer)
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted flex items-center gap-1"><MapPin size={12} /> Konum:</span>
                            <span className="font-semibold text-right truncate max-w-[120px]">{item.location || 'Belirtilmedi'}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Price and Action */}
                    <div className="border-t border-border pt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-secondary">{Number(item.price).toLocaleString('tr-TR')} ₺</span>
                      <a
                        href={itemType === 'artwork' ? `/artworks/${item.id}` : `/workshops`}
                        className="text-xs font-bold text-primary hover:underline"
                        onClick={() => setIsOpen(false)}
                      >
                        İncele &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {/* Placeholder to make up to 3 */}
              {[...Array(Math.max(0, 3 - items.length))].map((_, idx) => (
                <div key={idx} className="border border-dashed border-border rounded-lg flex items-center justify-center p-8 bg-muted-bg/10 min-h-[300px]">
                  <div className="text-center space-y-2">
                    <Scale size={28} className="text-muted/40 mx-auto" />
                    <p className="text-xs text-muted font-medium">Karşılaştırmak için bir {itemType === 'artwork' ? 'eser' : 'atölye'} daha ekleyin</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Comparison Analysis */}
            {analysis && (
              <div className="mt-8 bg-gradient-to-br from-primary/5 to-amber-500/5 dark:from-primary/10 dark:to-amber-500/10 border border-primary/20 rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 border-b border-primary/10 pb-3">
                  <span className="text-xl">📊</span>
                  <h4 className="font-serif font-bold text-secondary text-base md:text-lg">{analysis.title}</h4>
                </div>
                
                <ul className="space-y-2 text-xs md:text-sm text-foreground/95">
                  {analysis.bulletPoints.map((bp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span dangerouslySetInnerHTML={{ __html: bp.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ul>
                
                <div className="mt-4 pt-3 border-t border-primary/10 text-xs md:text-sm italic text-foreground/80 bg-primary/5 dark:bg-primary/20 p-3.5 rounded-lg">
                  <span dangerouslySetInnerHTML={{ __html: analysis.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            )}

          </div>
        </div>
      )}
      
      {/* Custom Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-zinc-900 border border-amber-500/30 px-6 py-4 rounded-2xl shadow-2xl max-w-sm md:max-w-md w-[90%] transition-all duration-300">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-500 text-sm">✨</span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ComparisonDrawer;
