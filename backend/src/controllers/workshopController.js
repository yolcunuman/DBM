// ═══════════════════════════════════════════════
//  Workshop Controller — Atölye/Etkinlik İş Mantığı
//  Geliştirici 2
// ═══════════════════════════════════════════════

const { Workshop, Reservation } = require('../models');
const { Op } = require('sequelize');

// GET /api/workshops — Tüm atölyeleri listele
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

// GET /api/workshops/:id — Tek atölye detayı
const getWorkshopById = async (req, res) => {
  try {
    const workshop = await Workshop.findByPk(req.params.id, {
      include: [{ association: 'reservations' }, { association: 'comments' }],
    });

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

    // Atölye kontrolü
    const workshop = await Workshop.findByPk(workshop_id);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Atölye bulunamadı.' });
    }

    // Kontenjan kontrolü
    const availableSpots = workshop.capacity - workshop.enrolled;
    if (num_participants > availableSpots) {
      return res.status(400).json({
        success: false,
        message: `Yetersiz kontenjan. Kalan: ${availableSpots} kişilik yer.`,
      });
    }

    // Toplam ücret hesapla
    const total_price = parseFloat(workshop.price) * num_participants;

    // Rezervasyon oluştur
    const reservation = await Reservation.create({
      user_id,
      workshop_id,
      num_participants,
      total_price,
      reservation_date: new Date(),
      notes,
    });

    // Enrolled sayısını güncelle
    await workshop.increment('enrolled', { by: num_participants });

    res.status(201).json({ success: true, data: reservation, message: 'Rezervasyon başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('createReservation error:', error);
    res.status(500).json({ success: false, message: 'Rezervasyon oluşturulurken hata oluştu.' });
  }
};

// GET /api/reservations?user_id=X — Kullanıcının rezervasyonları
const getReservations = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;

    const reservations = await Reservation.findAll({
      where,
      include: [{ association: 'workshop', attributes: ['id', 'title', 'date', 'start_time', 'location', 'image_url'] }],
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

    // Eğer katılımcı sayısı değişiyorsa kontenjan güncelle
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

    // Enrolled sayısını düşür
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
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  createReservation,
  getReservations,
  updateReservation,
  cancelReservation,
};
