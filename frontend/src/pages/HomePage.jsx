import React from 'react';

const HomePage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-gray-400 bg-gray-50 rounded-lg max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-serif text-gray-800 mb-4">🏠 Ana Sayfa (Ortak Alan)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Sistemin Vitrini ve Arama İşlemleri</h2>
      
      <div className="space-y-4 text-gray-700">
        <p><strong>Bu sayfa iki geliştiricinin ortak çalışmasıyla şekillenecek:</strong></p>
        <ul className="list-disc list-inside space-y-3">
          <li>
            <strong className="text-primary">Geliştirici 1 (Siz):</strong> Bu sayfada sergilenecek "Öne Çıkan Eserler" veya "Popüler Sanatçılar" bölümünün veritabanı sorgularını ve bileşenlerini (component) buraya ekleyeceksiniz.
          </li>
          <li>
            <strong className="text-secondary">Geliştirici 2 (Arkadaşınız):</strong> Bu sayfada sergilenecek "Yaklaşan Atölyeler" veya "Popüler Etkinlikler" bölümünün veritabanı sorgularını ve bileşenlerini buraya ekleyecek.
          </li>
          <li>
            <strong>🔍 Arama İşlevi (Navbar'daki veya buradaki):</strong> Arama çubuğuna yazılan metin, hem <em>Eserler</em> tablosunda (Geliştirici 1) hem de <em>Etkinlikler</em> tablosunda (Geliştirici 2) aranarak ortak bir sonuç ekranında gösterilmeli.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
