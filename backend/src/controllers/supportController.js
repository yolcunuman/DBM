// ═══════════════════════════════════════════════
//  Support Controller — Destek Talebi İş Mantığı
//  Geliştirici 2 — Madde 10, 16
// ═══════════════════════════════════════════════

const { SupportTicket } = require('../models');

// POST /api/support-tickets — Destek talebi oluştur
const createTicket = async (req, res) => {
  try {
    const { user_id, subject, message, category, priority } = req.body;

    const ticket = await SupportTicket.create({
      user_id, subject, message, category, priority,
    });

    res.status(201).json({ success: true, data: ticket, message: 'Destek talebiniz başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('createTicket error:', error);
    res.status(500).json({ success: false, message: 'Destek talebi oluşturulurken hata oluştu.' });
  }
};

// GET /api/support-tickets?user_id=X — Kullanıcının destek talepleri
const getTickets = async (req, res) => {
  try {
    const { user_id, status } = req.query;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (status) where.status = status;

    const tickets = await SupportTicket.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    console.error('getTickets error:', error);
    res.status(500).json({ success: false, message: 'Destek talepleri yüklenirken hata oluştu.' });
  }
};

// GET /api/support-tickets/:id — Tek destek talebi
const getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Destek talebi bulunamadı.' });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    console.error('getTicketById error:', error);
    res.status(500).json({ success: false, message: 'Destek talebi yüklenirken hata oluştu.' });
  }
};

// PUT /api/support-tickets/:id — Destek talebi güncelle (yönetici yanıtı)
const updateTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Destek talebi bulunamadı.' });
    }

    // Eğer resolved yapılıyorsa, resolved_at tarihini otomatik ekle
    if (req.body.status === 'resolved' && ticket.status !== 'resolved') {
      req.body.resolved_at = new Date();
    }

    await ticket.update(req.body);
    res.json({ success: true, data: ticket, message: 'Destek talebi başarıyla güncellendi.' });
  } catch (error) {
    console.error('updateTicket error:', error);
    res.status(500).json({ success: false, message: 'Destek talebi güncellenirken hata oluştu.' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
};
