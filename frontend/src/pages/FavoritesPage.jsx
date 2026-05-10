import React from 'react';

const FavoritesPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-serif text-primary mb-4">❤️ Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Favorilere Ekleme (Madde 3)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Kullanıcının beğendiği (favoriye aldığı) eserleri veritabanından çekip listeleme.</li>
          <li>Eseri favorilerden çıkarma işlemi (Silme butonu).</li>
          <li>Bu sayfadan eseri doğrudan sepete ekleme özelliği.</li>
        </ul>
      </div>
    </div>
  );
};

export default FavoritesPage;
