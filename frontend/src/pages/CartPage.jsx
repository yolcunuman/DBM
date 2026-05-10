import React from 'react';

const CartPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg">
      <h1 className="text-3xl font-serif text-primary mb-4">🛒 Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Satın Alma, Ödeme ve Kupon (Madde 6, 9)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Sepete eklenen eserlerin listesi, toplam tutar hesabı.</li>
          <li>Eseri sepetten çıkarma seçeneği.</li>
          <li>İndirim kuponu girilecek bir input alanı ve indirim hesaplaması (Madde 9).</li>
          <li>Ödeme yöntemi seçme alanı (örn: Kredi kartı, havale).</li>
          <li>Siparişi veya rezervasyonu onaylama butonu.</li>
        </ul>
      </div>
    </div>
  );
};

export default CartPage;
