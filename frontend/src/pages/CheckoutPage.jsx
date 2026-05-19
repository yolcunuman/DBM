import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Truck, CheckCircle2, Package, Tag, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast.jsx';

const API_URL = 'http://localhost:5001/api';

const VALID_COUPONS = {
  'SANAT10': { discount: 10, label: '%10 İndirim' },
  'YAZ10': { discount: 10, label: '%10 Yaz Fırsatı İndirimi' },
  'ARTISANA20': { discount: 20, label: '%20 İndirim' },
  'HOSGELDIN': { discount: 15, label: '%15 Hoş Geldin İndirimi' },
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { showToast, ToastUI } = useToast();
  const [cart, setCart] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedCheckoutCoupon, setAppliedCheckoutCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Lütfen bir kupon kodu girin.');
      return;
    }
    const found = VALID_COUPONS[code];
    if (found) {
      const couponObj = { code, ...found };
      setAppliedCheckoutCoupon(couponObj);
      localStorage.setItem('artisana_checkout_coupon', JSON.stringify(couponObj));
      window.dispatchEvent(new Event('artisana_cart_updated'));
      setCouponCode('');
    } else {
      setCouponError('Geçersiz kupon kodu.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCheckoutCoupon(null);
    localStorage.removeItem('artisana_checkout_coupon');
    window.dispatchEvent(new Event('artisana_cart_updated'));
    setCouponCode('');
  };

  const [form, setForm] = useState({
    fullName: '', phone: '', city: '', district: '', address: '', addressTitle: 'Ev',
    shippingMethod: 'standart',
    paymentMethod: 'credit_card',
    cardNumber: '', cardName: '', cardExpiry: '', cardCvv: '',
    sameAddress: true, agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const loadData = () => {
      const stored = localStorage.getItem('artisana_cart');
      if (stored) try { setCart(JSON.parse(stored)); } catch {}
      const promo = localStorage.getItem('artisana_coupon');
      if (promo) {
        try { setAppliedCoupon(JSON.parse(promo)); } catch {}
      } else {
        setAppliedCoupon(null);
      }
      const checkout = localStorage.getItem('artisana_checkout_coupon');
      if (checkout) {
        try { setAppliedCheckoutCoupon(JSON.parse(checkout)); } catch {}
      } else {
        setAppliedCheckoutCoupon(null);
      }
    };
    loadData();
    window.addEventListener('artisana_cart_updated', loadData);
    if (!userStr) navigate('/login');
    return () => window.removeEventListener('artisana_cart_updated', loadData);
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const subTotal = cart.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const shippingCost = form.shippingMethod === 'hizli' ? 150 : (subTotal >= 5000 ? 0 : 150);
  const freeShipping = form.shippingMethod !== 'hizli' && subTotal >= 5000;
  const promoDiscount = appliedCoupon ? (subTotal * appliedCoupon.discount) / 100 : 0;
  const subTotalAfterPromo = subTotal - promoDiscount;
  const checkoutDiscount = appliedCheckoutCoupon ? (subTotalAfterPromo * appliedCheckoutCoupon.discount) / 100 : 0;
  const discount = promoDiscount + checkoutDiscount;
  const total = subTotal - discount + (freeShipping ? 0 : shippingCost);

  // ─── Validasyon Fonksiyonları ──────────────────
  const validate = {
    fullName: (v) => {
      const parts = v.trim().split(/\s+/);
      if (parts.length < 2) return 'Ad ve soyadınızı girin (en az 2 kelime)';
      if (parts.some(p => p.length < 2)) return 'Her kelime en az 2 harf olmalıdır';
      if (!/^[a-zA-ZçüşöığÇÜŞÖİĞ\s]+$/i.test(v)) return 'Sadece harf kullanın';
      return '';
    },
    phone: (v) => {
      const cleaned = v.replace(/\s/g, '');
      if (!/^0[5][0-9]{9}$/.test(cleaned)) return 'Geçerli bir telefon girin (05XX XXX XX XX)';
      return '';
    },
    city: (v) => v.trim().length < 2 ? 'Geçerli bir il girin' : '',
    district: (v) => v.trim().length < 2 ? 'Geçerli bir ilçe girin' : '',
    address: (v) => v.trim().length < 15 ? 'Adres en az 15 karakter olmalıdır' : '',
    cardNumber: (v) => {
      const n = v.replace(/\s/g, '');
      if (!/^\d{16}$/.test(n)) return 'Kart numarası 16 haneli olmalıdır';
      return '';
    },
    cardName: (v) => v.trim().length < 3 ? 'Kart üzerindeki ismi girin' : '',
    cardExpiry: (v) => {
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return 'Format: AA/YY (ör. 12/27)';
      return '';
    },
    cardCvv: (v) => !/^\d{3}$/.test(v) ? 'CVV 3 haneli olmalıdır' : '',
  };

  const setField = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    if (errors[key] !== undefined) {
      const err = validate[key] ? validate[key](val) : '';
      setErrors(p => ({ ...p, [key]: err }));
    }
  };

  const validateStep1 = () => {
    const errs = {};
    ['fullName', 'phone', 'city', 'district', 'address'].forEach(k => {
      errs[k] = validate[k](form[k]);
    });
    setErrors(p => ({ ...p, ...errs }));
    return Object.values(errs).every(e => !e);
  };

  const validatePayment = () => {
    const errs = {};
    if (['credit_card', 'debit_card'].includes(form.paymentMethod)) {
      ['cardNumber', 'cardName', 'cardExpiry', 'cardCvv'].forEach(k => {
        errs[k] = validate[k](form[k]);
      });
    }
    setErrors(p => ({ ...p, ...errs }));
    return Object.values(errs).every(e => !e);
  };

  const handlePlaceOrder = async () => {
    if (!form.agreeTerms) { showToast('Lütfen sözleşmeleri onaylayın.', 'error'); return; }
    if (!validatePayment()) { return; }
    setIsSubmitting(true);
    try {
      for (const item of cart) {
        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            artwork_id: item.id,
            quantity: item.quantity,
            payment_method: form.paymentMethod,
            shipping_address: `${form.fullName} - ${form.phone} | ${form.address}, ${form.district}/${form.city}`,
            notes: `Kargo: ${form.shippingMethod === 'hizli' ? 'Hızlı' : 'Standart'}`,
            coupon_code: [
              appliedCoupon ? appliedCoupon.code : null,
              appliedCheckoutCoupon ? appliedCheckoutCoupon.code : null
            ].filter(Boolean).join('+') || null
          })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Sipariş oluşturulamadı.');
        }
      }
      localStorage.removeItem('artisana_cart');
      localStorage.removeItem('artisana_coupon');
      localStorage.removeItem('artisana_checkout_coupon');
      window.dispatchEvent(new Event('artisana_cart_updated'));
      setOrderSuccess(true);
      setTimeout(() => navigate('/profile?tab=orders'), 4000);
    } catch (error) { 
      showToast(error.message || 'Sipariş sırasında bir hata oluştu.', 'error');
    }
    finally { setIsSubmitting(false); }
  };

  if (orderSuccess) return (
    <div className="max-w-lg mx-auto text-center py-20 animate-fade-in space-y-6">
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 size={48} className="text-success" />
      </div>
      <div>
        <h2 className="text-3xl font-serif font-bold text-secondary">Siparişiniz Alındı!</h2>
        <p className="text-muted mt-2">Satıcı onayından sonra kargoya verilecek. Siparişlerinize yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );

  const steps = [
    { id: 1, label: 'Adres' },
    { id: 2, label: 'Kargo' },
    { id: 3, label: 'Ödeme' },
  ];

  return (
    <>
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-muted hover:text-primary transition-colors text-sm">
          <ArrowLeft size={16} /> Sepete Dön
        </button>
        <h1 className="text-2xl font-serif font-bold text-secondary">Güvenli Ödeme</h1>
        <div className="ml-auto flex items-center gap-1.5 text-muted text-xs">
          <Lock size={13} /> SSL ile korunmaktadır
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                ${activeStep === s.id ? 'bg-primary text-white shadow-md' : activeStep > s.id ? 'bg-success text-white' : 'bg-muted-bg text-muted border border-border'}`}
              >
                {activeStep > s.id ? <CheckCircle2 size={16} /> : s.id}
              </div>
              <span className={`text-sm font-medium ${activeStep === s.id ? 'text-primary' : activeStep > s.id ? 'text-success' : 'text-muted'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 transition-all ${activeStep > s.id ? 'bg-success' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ─── Sol: Formlar ─── */}
        <div className="flex-1 space-y-4">

          {/* ADIM 1: Adres */}
          <div className={`border rounded-xl bg-surface overflow-hidden transition-all ${activeStep === 1 ? 'border-primary/40 shadow-sm' : 'border-border'}`}>
            <div
              className={`flex items-center gap-3 p-5 cursor-pointer ${activeStep >= 1 ? 'hover:bg-muted-bg/40' : ''}`}
              onClick={() => activeStep > 1 && setActiveStep(1)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 1 ? 'bg-primary text-white' : activeStep > 1 ? 'bg-success text-white' : 'bg-muted-bg text-muted'}`}>
                {activeStep > 1 ? <CheckCircle2 size={16} /> : '1'}
              </div>
              <h2 className={`text-lg font-bold ${activeStep === 1 ? 'text-primary' : 'text-secondary'}`}>Teslimat Adresi</h2>
              {activeStep > 1 && <span className="ml-auto text-xs text-muted">{form.fullName} — {form.city}</span>}
            </div>

            {activeStep === 1 && (
              <div className="p-5 border-t border-border space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Ad Soyad *</label>
                    <input value={form.fullName} onChange={e => setField('fullName', e.target.value)} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 ${errors.fullName ? 'border-error' : 'border-border'}`} placeholder="Ahmet Yılmaz" />
                    {errors.fullName && <p className="text-error text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">Telefon *</label>
                    <input value={form.phone} onChange={e => setField('phone', e.target.value)} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 ${errors.phone ? 'border-error' : 'border-border'}`} placeholder="0532 000 00 00" />
                    {errors.phone && <p className="text-error text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">İl *</label>
                    <input value={form.city} onChange={e => setField('city', e.target.value)} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 ${errors.city ? 'border-error' : 'border-border'}`} placeholder="İstanbul" />
                    {errors.city && <p className="text-error text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">İlçe *</label>
                    <input value={form.district} onChange={e => setField('district', e.target.value)} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 ${errors.district ? 'border-error' : 'border-border'}`} placeholder="Kadıköy" />
                    {errors.district && <p className="text-error text-xs mt-1">{errors.district}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Açık Adres *</label>
                  <textarea value={form.address} onChange={e => setField('address', e.target.value)} rows={3} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none ${errors.address ? 'border-error' : 'border-border'}`} placeholder="Mahalle, sokak, bina no, daire..." />
                  {errors.address && <p className="text-error text-xs mt-1">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Adres Başlığı</label>
                  <div className="flex gap-2">
                    {['Ev', 'İş', 'Diğer'].map(t => (
                      <button key={t} onClick={() => set('addressTitle', t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.addressTitle === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:border-primary/50'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => { if (validateStep1()) setActiveStep(2); }}
                  className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-md"
                >
                  Kargo ile Devam Et
                </button>
              </div>
            )}
          </div>

          {/* ADIM 2: Kargo */}
          <div className={`border rounded-xl bg-surface overflow-hidden transition-all ${activeStep === 2 ? 'border-primary/40 shadow-sm' : 'border-border'} ${activeStep < 2 ? 'opacity-60' : ''}`}>
            <div
              className={`flex items-center gap-3 p-5 ${activeStep > 2 ? 'cursor-pointer hover:bg-muted-bg/40' : ''}`}
              onClick={() => activeStep > 2 && setActiveStep(2)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 2 ? 'bg-primary text-white' : activeStep > 2 ? 'bg-success text-white' : 'bg-muted-bg text-muted'}`}>
                {activeStep > 2 ? <CheckCircle2 size={16} /> : '2'}
              </div>
              <h2 className={`text-lg font-bold ${activeStep === 2 ? 'text-primary' : 'text-secondary'}`}>Kargo</h2>
              {activeStep > 2 && <span className="ml-auto text-xs text-muted">{form.shippingMethod === 'hizli' ? 'Hızlı Kargo' : 'Standart Kargo'}</span>}
            </div>

            {activeStep === 2 && (
              <div className="p-5 border-t border-border space-y-3">
                {[
                  { val: 'standart', label: 'Standart Kargo', sub: '3-5 İş Günü', price: freeShipping ? 'Ücretsiz' : '150 ₺', free: freeShipping, icon: <Truck size={20} /> },
                  { val: 'hizli', label: 'Hızlı Kargo', sub: '1-2 İş Günü', price: '150 ₺', free: false, icon: <Package size={20} /> },
                ].map(opt => (
                  <label key={opt.val}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${form.shippingMethod === opt.val ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted-bg/30'}`}
                  >
                    <input type="radio" name="ship" value={opt.val} checked={form.shippingMethod === opt.val} onChange={() => set('shippingMethod', opt.val)} className="accent-primary w-4 h-4" />
                    <div className={`${form.shippingMethod === opt.val ? 'text-primary' : 'text-muted'}`}>{opt.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-secondary">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.sub}</p>
                    </div>
                    <span className={`font-bold text-sm ${opt.free ? 'text-success' : 'text-secondary'}`}>{opt.price}</span>
                  </label>
                ))}
                <button onClick={() => setActiveStep(3)} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all hover:shadow-md mt-2">
                  Ödeme Adımına Geç
                </button>
              </div>
            )}
          </div>

          {/* ADIM 3: Ödeme */}
          <div className={`border rounded-xl bg-surface overflow-hidden transition-all ${activeStep === 3 ? 'border-primary/40 shadow-sm' : 'border-border'} ${activeStep < 3 ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 p-5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 3 ? 'bg-primary text-white' : 'bg-muted-bg text-muted'}`}>3</div>
              <h2 className={`text-lg font-bold ${activeStep === 3 ? 'text-primary' : 'text-secondary'}`}>Ödeme</h2>
            </div>

            {activeStep === 3 && (
              <div className="p-5 border-t border-border space-y-4">
                {/* Kredi Kartı */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                  <input type="radio" name="pay" value="credit_card" checked={form.paymentMethod === 'credit_card'} onChange={() => setForm(p => ({...p, paymentMethod: 'credit_card'}))} className="accent-primary w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-secondary flex items-center gap-2"><CreditCard size={16} /> Kredi Kartı</p>
                    {form.paymentMethod === 'credit_card' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <input value={form.cardNumber} onChange={e => setField('cardNumber', e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim())} placeholder="0000 0000 0000 0000" maxLength={19} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardNumber ? 'border-error' : 'border-border'}`} />
                          {errors.cardNumber && <p className="text-error text-xs mt-1">{errors.cardNumber}</p>}
                        </div>
                        <div>
                          <input value={form.cardName} onChange={e => setField('cardName', e.target.value)} placeholder="Kart Üzerindeki İsim" className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardName ? 'border-error' : 'border-border'}`} />
                          {errors.cardName && <p className="text-error text-xs mt-1">{errors.cardName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input value={form.cardExpiry} onChange={e => { let v = e.target.value.replace(/\D/g,''); if(v.length>=2) v=v.slice(0,2)+'/'+v.slice(2,4); setField('cardExpiry', v); }} placeholder="AA/YY" maxLength={5} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardExpiry ? 'border-error' : 'border-border'}`} />
                            {errors.cardExpiry && <p className="text-error text-xs mt-1">{errors.cardExpiry}</p>}
                          </div>
                          <div>
                            <input value={form.cardCvv} onChange={e => setField('cardCvv', e.target.value.replace(/\D/g,''))} placeholder="CVV" maxLength={3} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardCvv ? 'border-error' : 'border-border'}`} />
                            {errors.cardCvv && <p className="text-error text-xs mt-1">{errors.cardCvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Banka Kartı */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${form.paymentMethod === 'debit_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                  <input type="radio" name="pay" value="debit_card" checked={form.paymentMethod === 'debit_card'} onChange={() => setForm(p => ({...p, paymentMethod: 'debit_card'}))} className="accent-primary w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-secondary flex items-center gap-2"><CreditCard size={16} /> Banka Kartı (Debit)</p>
                    {form.paymentMethod === 'debit_card' && (
                      <div className="mt-3 space-y-3">
                        <div>
                          <input value={form.cardNumber} onChange={e => setField('cardNumber', e.target.value.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim())} placeholder="0000 0000 0000 0000" maxLength={19} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardNumber ? 'border-error' : 'border-border'}`} />
                          {errors.cardNumber && <p className="text-error text-xs mt-1">{errors.cardNumber}</p>}
                        </div>
                        <div>
                          <input value={form.cardName} onChange={e => setField('cardName', e.target.value)} placeholder="Kart Üzerindeki İsim" className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardName ? 'border-error' : 'border-border'}`} />
                          {errors.cardName && <p className="text-error text-xs mt-1">{errors.cardName}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input value={form.cardExpiry} onChange={e => { let v = e.target.value.replace(/\D/g,''); if(v.length>=2) v=v.slice(0,2)+'/'+v.slice(2,4); setField('cardExpiry', v); }} placeholder="AA/YY" maxLength={5} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardExpiry ? 'border-error' : 'border-border'}`} />
                            {errors.cardExpiry && <p className="text-error text-xs mt-1">{errors.cardExpiry}</p>}
                          </div>
                          <div>
                            <input value={form.cardCvv} onChange={e => setField('cardCvv', e.target.value.replace(/\D/g,''))} placeholder="CVV" maxLength={3} className={`w-full p-3 border rounded-lg bg-background text-sm focus:outline-none focus:border-primary ${errors.cardCvv ? 'border-error' : 'border-border'}`} />
                            {errors.cardCvv && <p className="text-error text-xs mt-1">{errors.cardCvv}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Onay checkboxları */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.sameAddress} onChange={e => set('sameAddress', e.target.checked)} className="accent-primary w-4 h-4" />
                    <span className="text-muted">Fatura adresim teslimat adresimle aynı</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => set('agreeTerms', e.target.checked)} className="accent-primary w-4 h-4" />
                    <span className="text-muted">
                      <span className="text-primary font-medium hover:underline cursor-pointer">Gizlilik Sözleşmesi</span> ve <span className="text-primary font-medium hover:underline cursor-pointer">Satış Sözleşmesi</span>'ni okudum, onaylıyorum.
                    </span>
                  </label>
                </div>

                {/* Siparişi Tamamla */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !form.agreeTerms}
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> İşleniyor...</>
                    : <><ShieldCheck size={18} /> Siparişi Tamamla</>
                  }
                </button>
                <p className="text-center text-xs text-muted flex items-center justify-center gap-1">
                  <Lock size={11} /> Ödemeler güvenli ve şifrelidir
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Sağ: Sipariş Özeti ─── */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-surface border border-border rounded-xl p-6 sticky top-24 space-y-4">
            <h2 className="text-lg font-bold text-secondary">Sipariş Özeti</h2>

            {/* Ürünler */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted-bg flex-shrink-0 border border-border">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-muted text-xs">🎨</div>
                    }
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{item.title}</p>
                    <p className="text-xs text-muted">{item.artist_name}</p>
                  </div>
                  <span className="text-sm font-bold text-secondary flex-shrink-0">
                    {(parseFloat(item.price) * item.quantity).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              ))}
            </div>

            {/* Kupon Kodu Girişi */}
            <div className="border-t border-border pt-4">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-medium text-muted">İndirim Kuponu</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Örn: YAZ10"
                    disabled={!!appliedCheckoutCoupon}
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:border-primary disabled:opacity-50"
                  />
                  {appliedCheckoutCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 border border-red-500/20 text-red-500 rounded-lg text-xs font-medium hover:bg-red-500/10 transition-colors"
                    >
                      Kaldır
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-dark transition-all duration-300 shadow-sm"
                    >
                      Uygula
                    </button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                {appliedCheckoutCoupon && (
                  <p className="text-xs text-success flex items-center gap-1">
                    🎉 <strong>{appliedCheckoutCoupon.code}</strong> uygulandı: {appliedCheckoutCoupon.label}
                  </p>
                )}
              </form>
            </div>

            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Ara Toplam</span><span>{subTotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Kargo</span>
                <span className={freeShipping ? 'text-success' : ''}>
                  {freeShipping ? 'Ücretsiz' : `${shippingCost.toLocaleString('tr-TR')} ₺`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1"><Tag size={12} /> Promosyon Kodu ({appliedCoupon.code})</span>
                  <span>−{promoDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              {appliedCheckoutCoupon && (
                <div className="flex justify-between text-success">
                  <span className="flex items-center gap-1"><Tag size={12} /> İndirim Kuponu ({appliedCheckoutCoupon.code})</span>
                  <span>−{checkoutDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="font-bold text-secondary text-lg">Toplam</span>
              <span className="font-bold text-2xl text-primary">{total.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>

      </div>
    </div>
    {ToastUI}
    </>
  );
};

export default CheckoutPage;
