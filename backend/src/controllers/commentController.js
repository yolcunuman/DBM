// ═══════════════════════════════════════════════
//  Comment Controller — Yorum İş Mantığı
//  Geliştirici 2 — Madde 12, 13, 14, 15
// ═══════════════════════════════════════════════

const { Comment } = require('../models');
const { Op } = require('sequelize');

// GET /api/comments?target_type=workshop&target_id=1&sort=newest
const getComments = async (req, res) => {
  try {
    const { target_type, target_id, sort } = req.query;
    const where = {};

    if (target_type) where.target_type = target_type;
    if (target_id) where.target_id = target_id;

    // Sıralama seçenekleri (Madde 13)
    let order;
    switch (sort) {
      case 'highest':
        order = [['rating', 'DESC']];
        break;
      case 'lowest':
        order = [['rating', 'ASC']];
        break;
      case 'helpful':
        order = [['helpful_count', 'DESC']];
        break;
      case 'oldest':
        order = [['created_at', 'ASC']];
        break;
      case 'newest':
      default:
        order = [['created_at', 'DESC']];
        break;
    }

    const comments = await Comment.findAll({ where, order });

    // Ortalama puan hesapla (Madde 13)
    const avgResult = await Comment.findOne({
      where,
      attributes: [
        [Comment.sequelize.fn('AVG', Comment.sequelize.col('rating')), 'avg_rating'],
        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('id')), 'total_count'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: comments,
      meta: {
        avg_rating: avgResult.avg_rating ? parseFloat(avgResult.avg_rating).toFixed(1) : null,
        total_count: parseInt(avgResult.total_count),
      },
    });
  } catch (error) {
    console.error('getComments error:', error);
    res.status(500).json({ success: false, message: 'Yorumlar yüklenirken hata oluştu.' });
  }
};

// POST /api/comments — Yorum yap
const createComment = async (req, res) => {
  try {
    const { user_id, target_type, target_id, content, rating } = req.body;

    const comment = await Comment.create({
      user_id, target_type, target_id, content, rating,
    });

    res.status(201).json({ success: true, data: comment, message: 'Yorum başarıyla eklendi.' });
  } catch (error) {
    console.error('createComment error:', error);
    res.status(500).json({ success: false, message: 'Yorum eklenirken hata oluştu.' });
  }
};

// PUT /api/comments/:id — Yorum güncelle
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı.' });
    }

    await comment.update(req.body);
    res.json({ success: true, data: comment, message: 'Yorum başarıyla güncellendi.' });
  } catch (error) {
    console.error('updateComment error:', error);
    res.status(500).json({ success: false, message: 'Yorum güncellenirken hata oluştu.' });
  }
};

// DELETE /api/comments/:id — Yorum sil
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı.' });
    }

    await comment.destroy();
    res.json({ success: true, message: 'Yorum başarıyla silindi.' });
  } catch (error) {
    console.error('deleteComment error:', error);
    res.status(500).json({ success: false, message: 'Yorum silinirken hata oluştu.' });
  }
};

// POST /api/comments/:id/helpful — Faydalı oyu ver (Madde 13)
const markHelpful = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı.' });
    }

    await comment.increment('helpful_count', { by: 1 });
    await comment.reload();

    res.json({ success: true, data: { helpful_count: comment.helpful_count }, message: 'Oy başarıyla verildi.' });
  } catch (error) {
    console.error('markHelpful error:', error);
    res.status(500).json({ success: false, message: 'Oy verilirken hata oluştu.' });
  }
};

// PUT /api/comments/:id/reply — Yönetici yanıtı (Madde 14)
const adminReply = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Yorum bulunamadı.' });
    }

    await comment.update({ admin_reply: req.body.admin_reply });
    res.json({ success: true, data: comment, message: 'Yanıt başarıyla eklendi.' });
  } catch (error) {
    console.error('adminReply error:', error);
    res.status(500).json({ success: false, message: 'Yanıt eklenirken hata oluştu.' });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  markHelpful,
  adminReply,
};
