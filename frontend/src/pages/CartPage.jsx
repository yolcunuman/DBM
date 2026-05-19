import React, { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowRight, Package, Palette, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const VALID_COUPONS = {
  'SANAT10': { discount: 10, label: '%10 İndirim' },
  'ARTISANA20': { discount: 20, label: '%20 İndirim' },
  'HOSGELDIN': { discount: 15, label: '%15 Hoş Geldin İndirimi' },
};

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Load cart and coupon from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('artisana_cart');
    if (stored) {
      try { setCart(JSON.parse(stored)); } catch {}
    }
    const coupon = localStorage.getItem('artisana_coupon');
    if (coupon) {
      try {
        const parsed = JSON.parse(coupon);
        setAppliedCoupon(parsed);
        setCouponSuccess(`"${parsed.code}" kodu uygulandı! ${parsed.label} kazandınız.`);
      } catch {}
    }
    // Listen for cart updates from other pages
    const onStorage = () => {
      const s = localStorage.getItem('artisana_cart');
      if (s) try { setCart(JSON.parse(s)); } catch {}
      const c = localStorage.getItem('artisana_coupon');
      if (c) {
        try {
          const parsed = JSON.parse(c);
          setAppliedCoupon(parsed);
          setCouponSuccess(`"${parsed.code}" kodu uygulandı! ${parsed.label} kazandınız.`);
        } catch {}
      } else {
        setAppliedCoupon(null);
        setCouponSuccess('');
      }
    };
    window.addEventListener('artisana_cart_updated', onStorage);
    return () => window.removeEventListener('artisana_cart_updated', onStorage);
  }, []);

  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem('artisana_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('artisana_cart_updated'));
  };

  const removeItem = (artworkId) => {
    saveCart(cart.filter(item => item.id !== artworkId));
  };

  const updateQuantity = (artworkId, delta) => {
    const updated = cart.map(item => {
      if (item.id !== artworkId) return item;
      const newQty = Math.max(1, Math.min(item.stock, item.quantity + delta));
      return { ...item, quantity: newQty };
    });
    saveCart(updated);
  };

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Lütfen bir kupon kodu girin.'); return; }
    const found = VALID_COUPONS[code];
    if (found) {
      const couponObj = { code, ...found };
      setAppliedCoupon(couponObj);
      localStorage.setItem('artisana_coupon', JSON.stringify(couponObj));
      window.dispatchEvent(new Event('artisana_cart_updated'));
      setCouponSuccess(`"${code}" kodu uygulandı! ${found.label} kazandınız.`);
      setCouponCode('');
    } else {
      setCouponError('Geçersiz kupon kodu. Lütfen tekrar deneyin.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('artisana_coupon');
    window.dispatchEvent(new Event('artisana_cart_updated'));
    setCouponSuccess('');
    setCouponCode('');
  };

  const subTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
  const shippingFree = subTotal >= 5000;
  const shippingCost = shippingFree ? 0 : 150;
  const discountAmount = appliedCoupon ? (subTotal * appliedCoupon.discount) / 100 : 0;
  const total = subTotal - discountAmount + shippingCost;

  const handleCheckout = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center py-20 space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart size={40} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-secondary">Sepetiniz Boş</h1>
            <p className="text-muted mt-2">Beğendiğiniz eserleri sepetinize ekleyerek satın alabilirsiniz.</p>
          </div>
          <Link
            to="/artworks"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all hover:shadow-lg"
          >
            <Palette size={18} /> Eserleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-secondary flex items-center gap-3">
          <ShoppingCart className="text-primary" /> Sepetim
          <span className="text-base font-sans font-normal text-muted bg-muted-bg px-3 py-1 rounded-full">
            {cart.length} ürün
          </span>
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ──────── Sol: Ürünler ──────── */}
        <div className="flex-1 space-y-4">

          {/* Kargo çubuğu */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted flex items-center gap-1.5">
                <Package size={14} /> Ücretsiz kargo için kalan:
              </span>
              <span className="font-bold text-secondary">
                {shippingFree ? '🎉 Ücretsiz Kargo!' : `${Math.max(0, 5000 - subTotal).toLocaleString('tr-TR')} ₺`}
              </span>
            </div>
            <div className="w-full h-2 bg-muted-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (subTotal / 5000) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0 ₺</span>
              <span>5.000 ₺</span>
            </div>
          </div>

          {/* Ürün listesi */}
          {cart.map(item => (
            <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex gap-4 p-4">
                {/* Görsel */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted-bg flex-shrink-0">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Palette size={24} className="text-muted" /></div>
                  }
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.category}</span>
                      <h3 className="font-bold text-secondary mt-0.5 leading-tight">{item.title}</h3>
                      <p className="text-sm text-muted">{item.artist_name}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-error transition-colors p-1 rounded flex-shrink-0"
                      title="Sepetten Kaldır"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Adet kontrolü */}
                    <div className="flex items-center gap-2 bg-muted-bg rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface disabled:opacity-40 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, +1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-surface disabled:opacity-40 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Fiyat */}
                    <div className="text-right">
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted">{Number(item.price).toLocaleString('tr-TR')} ₺ × {item.quantity}</p>
                      )}
                      <p className="text-lg font-bold text-secondary">
                        {(parseFloat(item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Alışverişe devam */}
          <Link to="/artworks" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors">
            ← Alışverişe Devam Et
          </Link>
        </div>

        {/* ──────── Sağ: Özet ──────── */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-24 space-y-5">
            <h2 className="text-xl font-bold text-secondary">Sipariş Özeti</h2>

            {/* Fiyat detayları */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Ara Toplam ({cart.reduce((s, i) => s + i.quantity, 0)} ürün)</span>
                <span>{subTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Kargo</span>
                <span className={shippingFree ? 'text-success font-medium' : ''}>
                  {shippingFree ? 'Ücretsiz' : `+${shippingCost.toLocaleString('tr-TR')} ₺`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-success font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> {appliedCoupon.code}
                    <button onClick={removeCoupon} className="ml-1 text-error hover:underline text-xs">×</button>
                  </span>
                  <span>−{discountAmount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <span className="font-bold text-secondary text-lg">Toplam</span>
              <span className="font-bold text-2xl text-primary">{total.toLocaleString('tr-TR')} ₺</span>
            </div>

            {/* Kupon */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Gift size={15} className="text-primary" /> Promosyon Kodu Kullan
              </label>
              {couponSuccess ? (
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm">
                  <Tag size={14} /> {couponSuccess}
                  <button onClick={removeCoupon} className="ml-auto text-error font-bold">×</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                    placeholder="Kupon kodu girin..."
                    className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-4 py-2.5 bg-secondary text-white rounded-lg text-sm font-bold hover:bg-secondary-dark transition-colors"
                  >
                    KULLAN
                  </button>
                </div>
              )}
              {couponError && <p className="text-error text-xs">{couponError}</p>}
            </div>

            {/* Ödemeye Geç */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              DEVAM ET <ArrowRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
              Ödemeler güvenli ve şifrelidir
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
