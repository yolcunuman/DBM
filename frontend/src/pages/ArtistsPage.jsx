import React from 'react';

const ArtistsPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-primary mb-4">🖌️ Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Sanatçıları Görüntüleme (Madde 1 Bağlantılı)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Kullanıcılar tablosunda "Sanatçı" rolüne sahip olan kullanıcıları (sanatçıları) listeleme.</li>
          <li>Sanatçının profil fotoğrafı, adı, soyadı ve biyografi gibi temel bilgilerini gösterme.</li>
          <li>Bir sanatçıya tıklandığında, kullanıcının o sanatçıya ait eserleri filtreleyerek görebileceği bir görünüme geçmesi (veya Sanatçı Detay sayfası).</li>
        </ul>
      </div>
    </div>
  );
};

export default ArtistsPage;
