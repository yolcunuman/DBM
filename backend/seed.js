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

    // 2. Artworks
    const artworks = [
      {
        title: 'Gece Rüyası',
        description: 'Soyut dışavurumculuk akımının güzel bir örneği olan bu eser, gecenin derinliğini anlatır.',
        price: 15000,
        category: 'Yağlı Boya',
        artist_name: 'Ahmet Yılmaz',
        artist_bio: '1980 doğumlu, modern sanat uzmanı.',
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop',
        is_available: true,
        technique: 'Tuval Üzerine Yağlı Boya',
        dimensions: '100x120 cm',
        year: 2023,
        stock: 1
      },
      {
        title: 'Mavinin Hüznü',
        description: 'Denizin dalgalı hali ve insan ruhunun derinliklerini yansıtan modern bir çalışma.',
        price: 12500,
        category: 'Akrilik',
        artist_name: 'Elif Şahin',
        artist_bio: 'İstanbul doğumlu sanatçı, uluslararası sergiler açmıştır.',
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop',
        is_available: true,
        technique: 'Tuval Üzerine Akrilik',
        dimensions: '80x100 cm',
        year: 2022,
        stock: 1
      },
      {
        title: 'Sonbahar Rüzgarı',
        description: 'Kuruyan yaprakların hışırtısını hissedebileceğiniz sıcak tonlarda bir tablo.',
        price: 8000,
        category: 'Suluboya',
        artist_name: 'Mehmet Demir',
        artist_bio: 'Doğa resimleriyle tanınan ödüllü ressam.',
        image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop',
        is_available: true,
        technique: 'Kağıt Üzerine Suluboya',
        dimensions: '50x70 cm',
        year: 2024,
        stock: 1
      },
      {
        title: 'Geometrik Denge',
        description: 'Çizgilerin ve renklerin kusursuz uyumu.',
        price: 21000,
        category: 'Dijital Sanat',
        artist_name: 'Ayşe Kaya',
        artist_bio: 'Dijital sanatın Türkiye\'deki öncülerinden.',
        image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
        is_available: false,
        technique: 'Dijital İllüstrasyon',
        dimensions: '60x90 cm',
        year: 2021,
        stock: 0
      },
      {
        title: 'Kent Karmaşası',
        description: 'Metropol hayatının hızını ve kaosunu anlatan dinamik bir eser.',
        price: 18000,
        category: 'Yağlı Boya',
        artist_name: 'Canan Öz',
        artist_bio: 'Şehir manzaraları ve sokak sanatı ile ilgileniyor.',
        image_url: 'https://images.unsplash.com/photo-1499892477393-f675706cbe6e?q=80&w=800&auto=format&fit=crop',
        is_available: true,
        technique: 'Yağlı Boya',
        dimensions: '120x150 cm',
        year: 2023,
        stock: 1
      }
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
