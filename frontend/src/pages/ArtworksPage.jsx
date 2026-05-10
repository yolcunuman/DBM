import React from 'react';

const ArtworksPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-primary mb-4">🎨 Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Eserleri İnceleme (Madde 1)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Eserleri (tablodan veya mock veriden) çekip listeleme.</li>
          <li>Eser görsellerini, fiyatını ve sanatçı bilgisini gösterme.</li>
          <li>Eser detay sayfasına yönlendirme (örn: <code className="bg-white px-2 py-1 rounded border">/artworks/:id</code>).</li>
          <li>Kategori, fiyat veya sanatçıya göre filtreleme özelliği.</li>
          <li>Eser karşılaştırma (Madde 11) özelliği için altyapı hazırlama.</li>
        </ul>
      </div>
    </div>
  );
};

export default ArtworksPage;
