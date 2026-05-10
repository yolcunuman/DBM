import React from 'react';

const ContactPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-secondary bg-secondary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-secondary mb-4">💬 Geliştirici 2 (Arkadaşınız)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Müşteri Destek (Madde 10)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Kullanıcıların iletişim formu (Ad, Email, Mesaj) üzerinden soru gönderebileceği alan.</li>
          <li>(Opsiyonel) Canlı destek veya mesajlaşma sistemi entegrasyonu.</li>
          <li>Kullanıcıların gönderdiği destek taleplerinin durumunu (Açık, Kapalı vs.) görebileceği bir tablo/liste.</li>
        </ul>
      </div>
    </div>
  );
};

export default ContactPage;
