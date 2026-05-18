// ═══════════════════════════════════════════════
//  Workshop Controller — Atölye/Etkinlik İş Mantığı
//  Geliştirici 2
// ═══════════════════════════════════════════════

const { Workshop, Reservation } = require('../models');
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
    location: 'Artisana Stüdyo, Beyoğlu - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/640px-Tsunami_by_hokusai_19th_century.jpg',
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
    location: 'Artisana Seramik Atölyesi, Karaköy - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Moai_Rano_rarridge.jpg/640px-Moai_Rano_rarridge.jpg',
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
    location: 'Artisana Galeri Atölyesi, Nişantaşı - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/402px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
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
    location: 'Artisana Dijital Stüdyo, Kadıköy - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/640px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
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
    location: 'Artisana Seramik Fırın, Moda - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/640px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
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
    location: 'Artisana Workshop, Cihangir - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/The_Scream.jpg/640px-The_Scream.jpg',
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
    location: 'Artisana Dijital Merkezi, Şişli - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/640px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg',
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
    location: 'Artisana El Sanatları Atölyesi, Üsküdar - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/VanGogh-starry_night_ballance1.jpg/640px-VanGogh-starry_night_ballance1.jpg',
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
    location: 'Artisana Büyük Salon, Beylikdüzü - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Good_Food_Display_-_NCI_Visuals_Online.jpg/640px-Good_Food_Display_-_NCI_Visuals_Online.jpg',
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
    location: 'Artisana Cam Stüdyo, Pendik - İstanbul',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Felis_silvestris_catus_lying_on_rice_straw.jpg/640px-Felis_silvestris_catus_lying_on_rice_straw.jpg',
    status: 'active'
  }
];

// ─── Seed: Veritabanına 10 atölye ekle ───────────
const seedWorkshops = async (req, res) => {
  try {
    const count = await Workshop.count();
    if (count >= 10) {
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
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { instructor: { [Op.iLike]: `%${search}%` } },
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
    const { user_id, workshop_id, num_participants, notes } = req.body;

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

    const total_price = parseFloat(workshop.price) * num_participants;

    const reservation = await Reservation.create({
      user_id,
      workshop_id,
      num_participants,
      total_price,
      reservation_date: new Date(),
      notes,
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
    if (user_id) where.user_id = user_id;

    const reservations = await Reservation.findAll({
      where,
      include: [{ association: 'workshop', attributes: ['id', 'title', 'date', 'start_time', 'location', 'image_url', 'instructor', 'category'] }],
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

    if (req.body.num_participants && req.body.num_participants !== reservation.num_participants) {
      const workshop = await Workshop.findByPk(reservation.workshop_id);
      const diff = req.body.num_participants - reservation.num_participants;
      const availableSpots = workshop.capacity - workshop.enrolled;

      if (diff > availableSpots) {
        return res.status(400).json({
          success: false,
          message: `Yetersiz kontenjan. Kalan: ${availableSpots} kişilik yer.`,
        });
      }

      await workshop.increment('enrolled', { by: diff });
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

    const workshop = await Workshop.findByPk(reservation.workshop_id);
    if (workshop) {
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
