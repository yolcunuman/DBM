import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız oldu.');
      }

      setSuccess(true);
      
      // Wait 3 seconds before redirecting
      setTimeout(() => {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/');
        }
        
        // Refresh page to update navbar state
        window.dispatchEvent(new Event("storage"));
        setLoading(false);
      }, 3000);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <h1 className="text-3xl font-serif text-primary mb-6 text-center">Giriş Yap</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-white/20 rounded-lg focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors disabled:opacity-50 text-white ${
              success ? 'bg-success hover:bg-success/90' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {success ? 'Giriş başarılı, yönlendiriliyor...' : loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-foreground/70">
          Hesabın yok mu? <Link to="/register" className="text-primary hover:underline">Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
