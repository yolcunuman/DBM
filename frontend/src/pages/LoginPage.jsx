import React from 'react';

const LoginPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-serif text-primary mb-4">🔐 Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Hesap Yönetimi / Giriş (Madde 7, 15)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Kullanıcının e-posta ve şifresi ile veritabanından doğrulanarak (Authentication) giriş yapması (Madde 7).</li>
          <li>Hatalı şifre/kullanıcı durumunda uyarı mesajlarının gösterilmesi.</li>
          <li>Sisteme giriş yapan kullanıcının oturum bilgisinin tutulması (Token veya Session).</li>
          <li><em>Önemli:</em> Yorum yapma ve rezervasyon gibi işlemlerin sadece giriş yapmış kullanıcılara açılması için güvenlik altyapısının kurulması (Madde 15 bağlantılı).</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginPage;
