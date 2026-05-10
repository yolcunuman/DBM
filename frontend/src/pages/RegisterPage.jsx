import React from 'react';

const RegisterPage = () => {
  return (
    <div className="p-8 border-2 border-dashed border-primary bg-primary/5 rounded-lg max-w-2xl mx-auto mt-10">
      <h1 className="text-3xl font-serif text-primary mb-4">📝 Geliştirici 1 (Siz)</h1>
      <h2 className="text-xl font-medium mb-6">Görev: Hesap Yönetimi / Kayıt (Madde 7)</h2>
      
      <div className="space-y-4 text-foreground/80">
        <p><strong>Bu sayfada yapılacaklar:</strong></p>
        <ul className="list-disc list-inside space-y-2">
          <li>Yeni kullanıcı oluşturmak için kayıt formu (Ad, Soyad, Email, Şifre vb.).</li>
          <li>Kullanıcının "Müşteri" veya "Sanatçı" olarak rol seçebilmesi ve veritabanına bu bilgiyle kaydedilmesi.</li>
          <li>Şifrelerin veritabanına doğrudan metin olarak değil, şifrelenerek (hashlenerek) kaydedilmesi güvenliği.</li>
          <li>Kayıt başarılı olduktan sonra kullanıcıyı giriş sayfasına yönlendirme.</li>
        </ul>
      </div>
    </div>
  );
};

export default RegisterPage;
