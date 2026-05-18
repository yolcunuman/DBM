const { sequelize, User, Artwork, Workshop, Order, SupportTicket, Comment } = require('./src/models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Veritabanını sıfırla ve yeniden oluştur

    // 1. User
    const user = await User.create({
      id: 1,
      name: 'Test Kullanıcısı',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });

    // 2. Artworks (20 eser, 6 sanatçı)
    const artworks = [
      // ── Ahmet Yılmaz (Yağlı Boya uzmanı) ──
      { title: 'Gece Rüyası', description: 'Soyut dışavurumculuk akımının güzel bir örneği, gecenin derinliğini anlatır.', price: 15000, category: 'Yağlı Boya', artist_name: 'Ahmet Yılmaz', artist_bio: '1980 doğumlu, modern sanat uzmanı.', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Yağlı Boya', dimensions: '100x120 cm', year: 2023, stock: 1 },
      { title: 'Kızıl Ufuk', description: 'Gün batımının dramatik kırmızı tonlarını tuvale yansıtan empresyonist bir çalışma.', price: 22000, category: 'Yağlı Boya', artist_name: 'Ahmet Yılmaz', artist_bio: '1980 doğumlu, modern sanat uzmanı.', image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Yağlı Boya', dimensions: '120x90 cm', year: 2022, stock: 1 },
      { title: 'İstanbul Sisli Sabah', description: 'Boğazın üzerindeki sisi ve şehrin siluetini yansıtan büyük format eser.', price: 35000, category: 'Yağlı Boya', artist_name: 'Ahmet Yılmaz', artist_bio: '1980 doğumlu, modern sanat uzmanı.', image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Yağlı Boya', dimensions: '150x200 cm', year: 2024, stock: 1 },

      // ── Elif Şahin (Akrilik & karma teknik) ──
      { title: 'Mavinin Hüznü', description: 'Denizin dalgalı hali ve insan ruhunun derinliklerini yansıtan modern bir çalışma.', price: 12500, category: 'Akrilik', artist_name: 'Elif Şahin', artist_bio: 'İstanbul doğumlu sanatçı, uluslararası sergiler açmıştır.', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Akrilik', dimensions: '80x100 cm', year: 2022, stock: 1 },
      { title: 'Neon Şehir', description: 'Modern şehrin gece ışıklarını neon renklerle yeniden yorumlayan çarpıcı bir akrilik eser.', price: 18500, category: 'Akrilik', artist_name: 'Elif Şahin', artist_bio: 'İstanbul doğumlu sanatçı, uluslararası sergiler açmıştır.', image_url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kanvas Üzerine Akrilik', dimensions: '90x120 cm', year: 2023, stock: 1 },
      { title: 'Pembe Bahçe', description: 'Baharın çiçeklenme sürecini pembenin tüm tonlarıyla anlatan neşeli bir kompozisyon.', price: 9800, category: 'Akrilik', artist_name: 'Elif Şahin', artist_bio: 'İstanbul doğumlu sanatçı, uluslararası sergiler açmıştır.', image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Akrilik', dimensions: '60x80 cm', year: 2021, stock: 1 },

      // ── Mehmet Demir (Suluboya & Natüralist) ──
      { title: 'Sonbahar Rüzgarı', description: 'Kuruyan yaprakların hışırtısını hissedebileceğiniz sıcak tonlarda bir tablo.', price: 8000, category: 'Suluboya', artist_name: 'Mehmet Demir', artist_bio: 'Doğa resimleriyle tanınan ödüllü ressam.', image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Suluboya', dimensions: '50x70 cm', year: 2024, stock: 1 },
      { title: 'Yağmur Sonrası Orman', description: 'Yağmurun ardından ormandaki tazeliği ve yeşilin binbir tonunu yansıtan bir suluboya.', price: 6500, category: 'Suluboya', artist_name: 'Mehmet Demir', artist_bio: 'Doğa resimleriyle tanınan ödüllü ressam.', image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Suluboya', dimensions: '40x60 cm', year: 2023, stock: 1 },
      { title: 'Boğaz Teknesi', description: 'İstanbul Boğazı\'nda bir balıkçı teknesini gün doğumunda gösteren dingin manzara.', price: 11000, category: 'Suluboya', artist_name: 'Mehmet Demir', artist_bio: 'Doğa resimleriyle tanınan ödüllü ressam.', image_url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Suluboya', dimensions: '55x75 cm', year: 2024, stock: 1 },

      // ── Ayşe Kaya (Dijital Sanat) ──
      { title: 'Geometrik Denge', description: 'Çizgilerin ve renklerin kusursuz uyumu.', price: 21000, category: 'Dijital Sanat', artist_name: 'Ayşe Kaya', artist_bio: 'Dijital sanatın Türkiye\'deki öncülerinden.', image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Dijital İllüstrasyon', dimensions: '60x90 cm', year: 2021, stock: 1 },
      { title: 'Fraktal Evren', description: 'Matematiğin güzelliğini fraktal yapılar aracılığıyla görselleştiren dijital bir sanat eseri.', price: 16000, category: 'Dijital Sanat', artist_name: 'Ayşe Kaya', artist_bio: 'Dijital sanatın Türkiye\'deki öncülerinden.', image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Dijital Baskı', dimensions: '70x100 cm', year: 2022, stock: 1 },
      { title: 'Sibernetik Rüya', description: 'İnsan ve teknolojinin kesişim noktasını sürrealist bir dijital kompozisyonla anlatan eser.', price: 28000, category: 'Dijital Sanat', artist_name: 'Ayşe Kaya', artist_bio: 'Dijital sanatın Türkiye\'deki öncülerinden.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Dijital Kompozisyon', dimensions: '80x120 cm', year: 2023, stock: 1 },

      // ── Canan Öz (Şehir & Sokak Sanatı) ──
      { title: 'Kent Karmaşası', description: 'Metropol hayatının hızını ve kaosunu anlatan dinamik bir eser.', price: 18000, category: 'Yağlı Boya', artist_name: 'Canan Öz', artist_bio: 'Şehir manzaraları ve sokak sanatı ile ilgileniyor.', image_url: 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Yağlı Boya', dimensions: '120x150 cm', year: 2023, stock: 1 },
      { title: 'Sokak Müzisyeni', description: 'İstanbul\'un tarihi sokaklarında bir müzisyeni canlı renkler ve dinamik fırça darbesiyle anlatan tablo.', price: 14500, category: 'Yağlı Boya', artist_name: 'Canan Öz', artist_bio: 'Şehir manzaraları ve sokak sanatı ile ilgileniyor.', image_url: 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Yağlı Boya', dimensions: '90x110 cm', year: 2022, stock: 1 },
      { title: 'Kapalıçarşı', description: 'Kapalıçarşı\'nın rengarenk atmosferini ve koşuşturmacasını tuvale aktaran büyüleyici bir eser.', price: 25000, category: 'Yağlı Boya', artist_name: 'Canan Öz', artist_bio: 'Şehir manzaraları ve sokak sanatı ile ilgileniyor.', image_url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Tuval Üzerine Yağlı Boya', dimensions: '140x170 cm', year: 2024, stock: 1 },

      // ── Zeynep Arslan (Soyut & Ekspresyonist) ──
      { title: 'Duygu Fırtınası', description: 'İçsel çalkantıları ve duygusal derinliği soyut lekeler ve renk katmanlarıyla ifade eden ekspresyonist bir çalışma.', price: 19500, category: 'Karma Teknik', artist_name: 'Zeynep Arslan', artist_bio: 'Ekspresyonist yaklaşımıyla tanınan genç sanatçı.', image_url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Karma Teknik', dimensions: '100x130 cm', year: 2023, stock: 1 },
      { title: 'Arınma', description: 'Beyaz boşluk ve ince renk geçişleriyle huzur ve arınma duygusunu anlatan minimalist soyut eser.', price: 13000, category: 'Karma Teknik', artist_name: 'Zeynep Arslan', artist_bio: 'Ekspresyonist yaklaşımıyla tanınan genç sanatçı.', image_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Karma Teknik', dimensions: '80x100 cm', year: 2022, stock: 1 },

      // ── Berk Özkan (Karakalem & Grafik) ──
      { title: 'Anatomik Sessizlik', description: 'İnsan anatomisini karakalem tekniğiyle aşırı detaylı biçimde gösteren, derin düşündüren bir eser.', price: 7500, category: 'Karakalem', artist_name: 'Berk Özkan', artist_bio: 'Karakalem ve grafik çizim alanında uzmanlaşmış sanatçı.', image_url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Karakalem', dimensions: '50x65 cm', year: 2023, stock: 1 },
      { title: 'Şehrin Nabzı', description: 'İstanbul\'un kuşbakışı görünümünü ince karakalem çizgilerle harita gibi işleyen özgün bir eser.', price: 9200, category: 'Karakalem', artist_name: 'Berk Özkan', artist_bio: 'Karakalem ve grafik çizim alanında uzmanlaşmış sanatçı.', image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Karakalem', dimensions: '60x80 cm', year: 2024, stock: 1 },
      { title: 'Huzur Arayışı', description: 'Minimalist çizgilerle betimlenmiş bir manzara.', price: 5500, category: 'Karakalem', artist_name: 'Berk Özkan', artist_bio: 'Karakalem ve grafik çizim alanında uzmanlaşmış sanatçı.', image_url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Karakalem', dimensions: '40x50 cm', year: 2023, stock: 1 },
      { title: 'Zamanın İzleri', description: 'Eski bir yapının detaylarını karakalemle ölümsüzleştiren bir çalışma.', price: 8800, category: 'Karakalem', artist_name: 'Berk Özkan', artist_bio: 'Karakalem ve grafik çizim alanında uzmanlaşmış sanatçı.', image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop', is_available: true, technique: 'Kağıt Üzerine Karakalem', dimensions: '50x70 cm', year: 2024, stock: 1 },
    ];

    for (let aw of artworks) {
      await Artwork.create(aw);
    }

    // 3. Workshops
    const workshops = [
      {
        title: 'İleri Seviye Yağlı Boya Teknikleri',
        description: 'Renk karıştırma, katmanlama ve fırça tekniklerinin derinlemesine incelendiği 4 haftalık yoğun program.',
        instructor: 'Prof. Ahmet Yılmaz',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        start_time: '14:00',
        end_time: '17:00',
        capacity: 15,
        enrolled: 12,
        price: 2500,
        location: 'Ana Stüdyo - Kadıköy',
        category: 'Yağlı Boya',
        image_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop'
      },
      {
        title: 'Yeni Başlayanlar İçin Suluboya',
        description: 'Suluboyanın temel prensiplerini öğrenin ve kendi manzara resminizi yapın.',
        instructor: 'Mehmet Demir',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        start_time: '10:00',
        end_time: '13:00',
        capacity: 20,
        enrolled: 20, // Full
        price: 1200,
        location: 'Bahçe Stüdyosu - Beşiktaş',
        category: 'Suluboya',
        image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop'
      },
      {
        title: 'Modern Heykel Atölyesi',
        description: 'Kil şekillendirme ve 3 boyutlu düşünme becerilerinizi geliştirin.',
        instructor: 'Deniz Işık',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        start_time: '15:00',
        end_time: '19:00',
        capacity: 10,
        enrolled: 2,
        price: 3500,
        location: 'Heykel Atölyesi - Şişli',
        category: 'Heykel',
        image_url: 'https://images.unsplash.com/photo-1612152605347-f8e2195f00e0?q=80&w=800&auto=format&fit=crop'
      }
    ];

    for (let w of workshops) {
      await Workshop.create(w);
    }

    // 4. Orders
    await Order.create({
      user_id: 1,
      artwork_id: 1,
      quantity: 1,
      total_price: 15000,
      status: 'pending'
    });
    await Order.create({
      user_id: 1,
      artwork_id: 2,
      quantity: 1,
      total_price: 12500,
      status: 'shipped'
    });

    // 5. Support Tickets
    await SupportTicket.create({
      user_id: 1,
      subject: 'Tablom Kırık Geldi',
      category: 'order',
      message: 'Merhaba, sipariş ettiğim tablo kargoda hasar görmüş.',
      status: 'open'
    });

    console.log('✅ Veritabanı başarıyla test verileriyle dolduruldu!');
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
};

seed();
