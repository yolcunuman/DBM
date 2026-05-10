import React from 'react';

const WorkshopsPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-secondary bg-secondary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-secondary mb-4">📅 Geliştirici 2 (Arkadaşınız)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Atölye/Etkinlik ve Rezervasyon (Madde 2, 4, 5)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Düzenlenen etkinlikleri ve atölyeleri listeleme.</li>
          <li>Etkinlik tarihi, saati, ücreti ve boş kontenjanını gösterme.</li>
          <li>Kullanıcının kontenjan dahilinde rezervasyon yapabileceği bir buton/form ekleme (Madde 4).</li>
          <li>Kullanıcının katılımcı sayısı seçebilmesi.</li>
          <li>Etkinlik detay sayfasına yönlendirme (örn: <code className="bg-white px-2 py-1 rounded border">/workshops/:id</code>).</li>
        </ul>
      </div>
    </div>
  );
};

export default WorkshopsPage;
