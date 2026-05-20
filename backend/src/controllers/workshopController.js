// ═══════════════════════════════════════════════
//  Workshop Controller — Atölye/Etkinlik İş Mantığı
//  Geliştirici 2
// ═══════════════════════════════════════════════

const { Workshop, Reservation, User } = require('../models');
const { Op } = require('sequelize');

// ─── 10 Adet Atölye Seed Verisi ─────────────────
const SEED_WORKSHOPS = [
  {
    title: 'Suluboya ile Doğa Resimleri',
    description: 'Bu atölyede suluboya tekniklerini kullanarak doğadan ilham alan peyzaj resimleri yapacaksınız. Başlangıç ve orta seviye katılımcılara yönelik olan bu çalışmada renk karıştırma, yıkama teknikleri ve doğa detaylarını aktarma becerilerini geliştireceksiniz.',
    instructor: 'Ayşe Korkmaz',
    category: 'Suluboya',
    date: '2025-07-10',
    start_time: '10:00:00',
    end_time: '13:00:00',
    price: 450,
    capacity: 15,
    enrolled: 8,
    location: 'Galerist Stüdyo, Beyoğlu - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600',
    status: 'active'
  },
  {
    title: 'Kil ile Heykel Temel Kursu',
    description: 'Kil işçiliğinin temellerini öğreneceğiniz bu atölyede form oluşturma, yüzey dokuları ve basit heykel teknikleri üzerine çalışacaksınız. Kendi seramik figürünüzü yaratma fırsatı bulacaksınız.',
    instructor: 'Baran Yıldız',
    category: 'Heykel',
    date: '2025-07-15',
    start_time: '14:00:00',
    end_time: '17:00:00',
    price: 600,
    capacity: 12,
    enrolled: 10,
    location: 'Galerist Seramik Atölyesi, Karaköy - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600',
    status: 'active'
  },
  {
    title: 'Yağlıboya Portre Atölyesi',
    description: 'Canlı model eşliğinde yağlıboya portre çalışması yapacağınız bu atölyede yüz anatomisi, renk skalası ve ışık-gölge teknikleri üzerinde yoğunlaşacaksınız. Orta ve ileri seviye sanatçılara önerilir.',
    instructor: 'Elif Yılmaz',
    category: 'Yağlı Boya',
    date: '2025-07-20',
    start_time: '11:00:00',
    end_time: '15:00:00',
    price: 850,
    capacity: 10,
    enrolled: 7,
    location: 'Galerist Galeri Atölyesi, Nişantaşı - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    status: 'active'
  },
  {
    title: 'Fotoğraf Sanatı ve Kompozisyon',
    description: 'Fotoğraf makinenizi daha etkin kullanmayı öğreneceğiniz bu atölyede kompozisyon kuralları, ışık yönetimi ve post-prodüksiyon teknikleri ele alınacaktır. DSLR veya aynasız fotoğraf makinenizi getirmeniz yeterli.',
    instructor: 'Deniz Şahin',
    category: 'Fotoğrafçılık',
    date: '2025-07-25',
    start_time: '09:00:00',
    end_time: '13:00:00',
    price: 500,
    capacity: 20,
    enrolled: 13,
    location: 'Galerist Dijital Stüdyo, Kadıköy - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    status: 'active'
  },
  {
    title: 'Seramik Çamlıca Sır Teknikleri',
    description: 'Seramiğin sır kaplama ve fırınlama süreçlerini derinlemesine öğreneceğiniz ileri seviye bu atölyede özgün glazür tarifleri geliştirme ve yüzey dekorasyon teknikleri üzerine çalışılacaktır.',
    instructor: 'Selin Aydın',
    category: 'Seramik',
    date: '2025-08-01',
    start_time: '10:00:00',
    end_time: '16:00:00',
    price: 1200,
    capacity: 8,
    enrolled: 6,
    location: 'Galerist Seramik Fırın, Moda - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
    status: 'active'
  },
  {
    title: 'Baskı Sanatı: Linol Kesim',
    description: 'Geleneksel baskı tekniklerinden linol kesim yöntemini öğreneceğiniz bu atölyede tasarım oluşturma, kesim teknikleri ve çeşitli yüzeylere baskı alma üzerine uygulamalı çalışmalar yapacaksınız.',
    instructor: 'Can Öztürk',
    category: 'Baskı Sanatı',
    date: '2025-08-05',
    start_time: '13:00:00',
    end_time: '17:00:00',
    price: 380,
    capacity: 16,
    enrolled: 5,
    location: 'Galerist Workshop, Cihangir - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600',
    status: 'active'
  },
  {
    title: 'Dijital İllüstrasyon ve Tablet',
    description: 'Grafik tablet kullanarak dijital çizim ve illüstrasyon tekniklerini öğreneceğiniz bu atölyede Procreate ve Photoshop programları üzerinde çalışılacaktır. Tablet sağlanmaktadır.',
    instructor: 'Zeynep Demir',
    category: 'Dijital Sanat',
    date: '2025-08-10',
    start_time: '14:00:00',
    end_time: '18:00:00',
    price: 750,
    capacity: 18,
    enrolled: 14,
    location: 'Galerist Dijital Merkezi, Şişli - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    status: 'active'
  },
  {
    title: 'Mozaik Sanatı Atölyesi',
    description: 'Antik Yunan ve Roma\'dan bu yana süregelen mozaik sanatını modern tekniklerle buluşturduğumuz bu atölyede cam, taş ve seramik kırıkları ile özgün dekoratif çalışmalar üreteceksiniz.',
    instructor: 'Mehmet Aslan',
    category: 'El Sanatları',
    date: '2025-08-15',
    start_time: '10:00:00',
    end_time: '14:00:00',
    price: 550,
    capacity: 14,
    enrolled: 9,
    location: 'Galerist El Sanatları Atölyesi, Üsküdar - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600',
    status: 'active'
  },
  {
    title: 'Soyut Ekspresyonizm Üzerine',
    description: 'Soyut ekspresyonizmin tarihini ve tekniklerini inceleyeceğimiz bu yoğun atölyede duyguları renge ve forma aktarma, spontane boyama ve büyük format çalışmaları üzerine deneysel uygulamalar yapacaksınız.',
    instructor: 'Ahmet Kara',
    category: 'Soyut',
    date: '2025-08-20',
    start_time: '11:00:00',
    end_time: '16:00:00',
    price: 900,
    capacity: 12,
    enrolled: 4,
    location: 'Galerist Büyük Salon, Beylikdüzü - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600',
    status: 'active'
  },
  {
    title: 'Cam Füzyon ve Vitray',
    description: 'Cam eritme ve vitray tekniklerini öğreneceğiniz bu özel atölyede renk teorisi, cam kesimi, kurşun bağlantı ve fırın çalışması konuları ele alınacaktır. Tüm malzemeler dahildir.',
    instructor: 'Deniz Şahin',
    category: 'Cam Sanatı',
    date: '2025-08-28',
    start_time: '09:30:00',
    end_time: '15:30:00',
    price: 1400,
    capacity: 8,
    enrolled: 7,
    location: 'Galerist Cam Stüdyo, Pendik - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=600',
    status: 'active'
  },
  {
    title: 'Kişiye Özel Seramik Atölyesi (Tarih/Saat Seçilebilir)',
    description: 'Tamamen sizin seçtiğiniz gün ve saatte gerçekleştirilen, eğitmenle birebir çalışacağınız özel seramik dersi.',
    instructor: 'Elif Yılmaz',
    category: 'Özel Ders',
    date: '2025-09-01',
    start_time: '10:00:00',
    end_time: '12:00:00',
    price: 1500,
    capacity: 5,
    enrolled: 0,
    location: 'Galerist Seramik Atölyesi, Karaköy - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    status: 'active'
  },
  {
    title: 'Birebir Resim ve Teknik Danışmanlık (Tarih/Saat Seçilebilir)',
    description: 'Kendi seviyenize ve ilgi alanınıza uygun olarak gün/saat belirleyebileceğiniz birebir resim atölyesi.',
    instructor: 'Ayşe Korkmaz',
    category: 'Özel Ders',
    date: '2025-09-02',
    start_time: '14:00:00',
    end_time: '16:00:00',
    price: 1200,
    capacity: 5,
    enrolled: 0,
    location: 'Galerist Stüdyo, Beyoğlu - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    status: 'active'
  },
  {
    title: 'Kişiye Özel Heykel ve Form Eğitimi (Tarih/Saat Seçilebilir)',
    description: 'Heykel sanatına giriş yapmak veya kendi projenizi geliştirmek için tarihini ve saatini sizin belirlediğiniz özel heykel dersi.',
    instructor: 'Baran Yıldız',
    category: 'Özel Ders',
    date: '2025-09-03',
    start_time: '16:00:00',
    end_time: '18:00:00',
    price: 1800,
    capacity: 5,
    enrolled: 0,
    location: 'Galerist Seramik Atölyesi, Karaköy - İstanbul',
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    status: 'active'
  }
];

// ─── Seed: Veritabanına 10 atölye ekle ───────────
const seedWorkshops = async (req, res) => {
  try {
    const count = await Workshop.count();
    if (count >= 13) {
      const data = await Workshop.findAll({ order: [['date', 'ASC']] });
      if (res && res.json) return res.json({ success: true, message: 'Atölyeler zaten mevcut.', data });
      return;
    }

    const workshops = await Workshop.bulkCreate(SEED_WORKSHOPS);
    const msg = `${workshops.length} atölye başarıyla oluşturuldu.`;
    if (res && res.json) return res.status(201).json({ success: true, message: msg, data: workshops });
    console.log(`🎭 ${msg}`);
  } catch (error) {
    if (res && res.status) return res.status(500).json({ success: false, message: error.message });
    console.error('Workshop seed hatası:', error.message);
  }
};

// GET /api/workshops — Tüm atölyeleri listele (filtreleme destekli)
const getAllWorkshops = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const where = {};

    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      const isSqlite = Workshop.sequelize.options.dialect === 'sqlite';
      const likeOp = isSqlite ? Op.like : Op.iLike;
      where[Op.or] = [
        { title: { [likeOp]: `%${search}%` } },
        { description: { [likeOp]: `%${search}%` } },
        { instructor: { [likeOp]: `%${search}%` } },
      ];
    }

    const workshops = await Workshop.findAll({
      where,
      order: [['date', 'ASC']],
    });

    res.json({ success: true, data: workshops });
  } catch (error) {
    console.error('getAllWorkshops error:', error);
    res.status(500).json({ success: false, message: 'Atölyeler yüklenirken hata oluştu.' });
  }
};

// GET /api/workshops/categories — Kategorileri listele
const getWorkshopCategories = async (req, res) => {
  try {
    const rows = await Workshop.findAll({ attributes: ['category'], group: ['category'] });
    res.json({ success: true, data: rows.map(r => r.category) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/workshops/:id — Tek atölye detayı
const getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Atölye bulunamadı.' });
    }
    res.json({ success: true, data: workshop });
  } catch (error) {
    console.error('getWorkshopById error:', error);
    res.status(500).json({ success: false, message: 'Atölye detayı yüklenirken hata oluştu.' });
  }
};

// POST /api/workshops — Yeni atölye oluştur (admin)
const createWorkshop = async (req, res) => {
  try {
    const { title, description, instructor, category, date, start_time, end_time, price, capacity, location, image_url } = req.body;

    const workshop = await Workshop.create({
      title, description, instructor, category, date,
      start_time, end_time, price, capacity, location, image_url,
    });

    res.status(201).json({ success: true, data: workshop, message: 'Atölye başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('createWorkshop error:', error);
    res.status(500).json({ success: false, message: 'Atölye oluşturulurken hata oluştu.' });
  }
};

// PUT /api/workshops/:id — Atölye güncelle
const updateWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Atölye bulunamadı.' });
    }

    await workshop.update(req.body);
    res.json({ success: true, data: workshop, message: 'Atölye başarıyla güncellendi.' });
  } catch (error) {
    console.error('updateWorkshop error:', error);
    res.status(500).json({ success: false, message: 'Atölye güncellenirken hata oluştu.' });
  }
};

// DELETE /api/workshops/:id — Atölye sil
const deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Atölye bulunamadı.' });
    }

    await workshop.destroy();
    res.json({ success: true, message: 'Atölye başarıyla silindi.' });
  } catch (error) {
    console.error('deleteWorkshop error:', error);
    res.status(500).json({ success: false, message: 'Atölye silinirken hata oluştu.' });
  }
};

// ─── Rezervasyon İşlemleri ──────────────────────

// POST /api/reservations — Rezervasyon yap
const createReservation = async (req, res) => {
  try {
    const { workshop_id, num_participants, notes, coupon_code, chosen_date, chosen_time } = req.body;
    const user_id = req.user.role === 'ADMIN' && req.body.user_id ? req.body.user_id : req.user.id;

    const workshop = await Workshop.findByPk(workshop_id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Atölye bulunamadı.' });
    }

    const availableSpots = workshop.capacity - workshop.enrolled;
    if (num_participants > availableSpots) {
      return res.status(400).json({
        success: false,
        message: `Yetersiz kontenjan. Kalan: ${availableSpots} kişilik yer.`,
      });
    }

    const basePrice = parseFloat(workshop.price) * num_participants;
    let currentPrice = basePrice;
    if (coupon_code) {
      const codes = coupon_code.split('+').map(c => c.trim().toUpperCase());
      for (const code of codes) {
        let discountPct = 0;
        if (code === 'SANAT10' || code === 'YAZ10') discountPct = 10;
        else if (code === 'GALERIST20') discountPct = 20;
        else if (code === 'HOSGELDIN') discountPct = 15;

        if (discountPct > 0) {
          currentPrice -= (currentPrice * discountPct) / 100;
        }
      }
    }
    const total_price = currentPrice;

    let finalNotes = notes || '';
    if (chosen_time) {
      finalNotes = `[Tercih Edilen Saat: ${chosen_time}] ${finalNotes}`.trim();
    }
    if (coupon_code) {
      finalNotes = `${finalNotes} (Kupon: ${coupon_code})`.trim();
    }

    const reservation = await Reservation.create({
      user_id,
      workshop_id,
      num_participants,
      total_price,
      reservation_date: chosen_date || new Date(),
      notes: finalNotes || null,
    });

    await workshop.increment('enrolled', { by: num_participants });

    res.status(201).json({ success: true, data: reservation, message: 'Rezervasyon başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('createReservation error:', error);
    res.status(500).json({ success: false, message: 'Rezervasyon oluşturulurken hata oluştu.' });
  }
};

// GET /api/reservations — Kullanıcının rezervasyonları
const getReservations = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = {};

    // Admin değilse sadece kendi rezervasyonlarını görebilir
    if (req.user.role !== 'ADMIN') {
      where.user_id = req.user.id;
    } else if (user_id) {
      where.user_id = user_id;
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        { association: 'workshop', attributes: ['id', 'title', 'date', 'start_time', 'location', 'image_url', 'instructor', 'category', 'price'] },
        { association: 'user', attributes: ['id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error('getReservations error:', error);
    res.status(500).json({ success: false, message: 'Rezervasyonlar yüklenirken hata oluştu.' });
  }
};

// PUT /api/reservations/:id — Rezervasyon güncelle
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Rezervasyon bulunamadı.' });
    }

    // Admin değilse ve kendi rezervasyonu değilse güncellemeye izin verme
    if (req.user.role !== 'ADMIN' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu işlemi yapmaya yetkiniz yok.' });
    }

    const workshop = await Workshop.findByPk(reservation.workshop_id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'İlişkili atölye bulunamadı.' });
    }

    // 1. Durum Değişikliği ve Kontenjan Güncellemesi
    if (req.body.status && req.body.status !== reservation.status) {
      const oldStatus = reservation.status;
      const newStatus = req.body.status;

      // Eskiden iptal edilmiş olan bir rezervasyonu onaylıyor veya beklemeye alıyorsak (kontenjan artmalı)
      if (oldStatus === 'cancelled' && (newStatus === 'confirmed' || newStatus === 'pending')) {
        const availableSpots = workshop.capacity - workshop.enrolled;
        if (reservation.num_participants > availableSpots) {
          return res.status(400).json({
            success: false,
            message: `Yetersiz kontenjan. Atölyede kalan yer: ${availableSpots} kişi.`,
          });
        }
        await workshop.increment('enrolled', { by: reservation.num_participants });
      }
      // Eskiden onaylı veya bekleyen olan bir rezervasyonu iptal ediyorsak (kontenjan azalmalı)
      else if ((oldStatus === 'confirmed' || oldStatus === 'pending') && newStatus === 'cancelled') {
        await workshop.decrement('enrolled', { by: reservation.num_participants });
      }
    }

    // 2. Katılımcı Sayısı Değişikliği (durum iptal değilse)
    if (req.body.num_participants && req.body.num_participants !== reservation.num_participants) {
      // Eğer rezervasyon iptal durumunda değilse kontenjanı güncelle
      if (reservation.status !== 'cancelled' && req.body.status !== 'cancelled') {
        const diff = req.body.num_participants - reservation.num_participants;
        const availableSpots = workshop.capacity - workshop.enrolled;

        if (diff > availableSpots) {
          return res.status(400).json({
            success: false,
            message: `Yetersiz kontenjan. Kalan: ${availableSpots} kişilik yer.`,
          });
        }

        await workshop.increment('enrolled', { by: diff });
      }
      req.body.total_price = parseFloat(workshop.price) * req.body.num_participants;
    }

    await reservation.update(req.body);
    res.json({ success: true, data: reservation, message: 'Rezervasyon başarıyla güncellendi.' });
  } catch (error) {
    console.error('updateReservation error:', error);
    res.status(500).json({ success: false, message: 'Rezervasyon güncellenirken hata oluştu.' });
  }
};

// DELETE /api/reservations/:id — Rezervasyon iptal
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Rezervasyon bulunamadı.' });
    }

    // Admin değilse ve kendi rezervasyonu değilse iptale izin verme
    if (req.user.role !== 'ADMIN' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bu işlemi yapmaya yetkiniz yok.' });
    }

    const workshop = await Workshop.findByPk(reservation.workshop_id);
    if (workshop && reservation.status !== 'cancelled') {
      await workshop.decrement('enrolled', { by: reservation.num_participants });
    }

    await reservation.update({ status: 'cancelled' });
    res.json({ success: true, message: 'Rezervasyon başarıyla iptal edildi.' });
  } catch (error) {
    console.error('cancelReservation error:', error);
    res.status(500).json({ success: false, message: 'Rezervasyon iptal edilirken hata oluştu.' });
  }
};

module.exports = {
  seedWorkshops,
  getAllWorkshops,
  getWorkshopById,
  getWorkshopCategories,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  createReservation,
  getReservations,
  updateReservation,
  cancelReservation,
};
