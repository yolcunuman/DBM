import React from 'react';

const ProfilePage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-primary mb-4">👤 Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Hesap Yönetimi ve Takip (Madde 7, 8)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Profil bilgilerini (Ad, Soyad, Email vb.) görüntüleme ve güncelleme formu.</li>
          <li>Şifre değiştirme alanı.</li>
          <li>Geçmiş siparişleri (satın alınan eserlerin durumu) listeleme alanı (Madde 8).</li>
          <li><em>Ortak:</em> Geliştirici 2'nin "Rezervasyonlarım" listesini koyabileceği bir sekme/alan ayırmak.</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
