import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const checkPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, text: '', color: 'bg-transparent', width: 'w-0' };
  
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[@$!%*?&.]/.test(pwd)) score += 1;
  
  let text = '';
  let color = '';
  let width = '';
  switch(score) {
    case 1:
      text = 'Çok Zayıf';
      color = 'bg-red-500';
      width = 'w-1/5';
      break;
    case 2:
      text = 'Zayıf';
      color = 'bg-orange-500';
      width = 'w-2/5';
      break;
    case 3:
      text = 'Orta';
      color = 'bg-yellow-500';
      width = 'w-3/5';
      break;
    case 4:
      text = 'Güçlü';
      color = 'bg-blue-500';
      width = 'w-4/5';
      break;
    case 5:
      text = 'Çok Güçlü';
      color = 'bg-emerald-500';
      width = 'w-full';
      break;
    default:
      text = 'Geçersiz';
      color = 'bg-red-500';
      width = 'w-0';
  }
  return { score, text, color, width };
};

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const strength = checkPasswordStrength(formData.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (strength.score < 3) {
      setError('Şifreniz yeterince güçlü değil! En az "Orta" seviye şifre belirlemelisiniz.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt başarısız oldu.');
      }

      // Automatically log them in after registration
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      window.dispatchEvent(new Event("storage"));
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const criteria = [
    { label: 'En az 8 karakter', met: formData.password.length >= 8 },
    { label: 'En az bir büyük harf (A-Z)', met: /[A-Z]/.test(formData.password) },
    { label: 'En az bir küçük harf (a-z)', met: /[a-z]/.test(formData.password) },
    { label: 'En az bir rakam (0-9)', met: /[0-9]/.test(formData.password) },
    { label: 'En az bir özel karakter (@$!%*?&.)', met: /[@$!%*?&.]/.test(formData.password) },
  ];

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <h1 className="text-3xl font-serif text-primary mb-6 text-center">Kayıt Ol</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ad Soyad</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="Adınız Soyadınız"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre Tekrar</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••"
                required
              />
            </div>
          </div>

          {/* Şifre Gücü Göstergesi */}
          {formData.password && (
            <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-foreground/75 font-medium">Şifre Gücü:</span>
                <span className={`font-bold ${
                  strength.score <= 2 ? 'text-red-400' : strength.score === 3 ? 'text-yellow-400' : 'text-emerald-400'
                }`}>{strength.text}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px]">
                {criteria.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={item.met ? 'text-emerald-400 font-bold' : 'text-foreground/30'}>
                      {item.met ? '✓' : '•'}
                    </span>
                    <span className={item.met ? 'text-foreground/80' : 'text-foreground/45'}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Kaydediliyor...' : 'Hesap Oluştur'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-foreground/70">
          Zaten hesabın var mı? <Link to="/login" className="text-primary hover:underline">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
