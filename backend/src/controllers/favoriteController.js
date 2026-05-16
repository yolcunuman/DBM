// ═══════════════════════════════════════════════
//  Favorite Controller — Favori İş Mantığı
// ═══════════════════════════════════════════════

const { Favorite, Artwork } = require('../models');

// ─── Favoriye ekle / çıkar (Toggle) ────────────
const toggleFavorite = async (req, res) => {
  try {
    const { user_id, artwork_id } = req.body;

    const existing = await Favorite.findOne({ where: { user_id, artwork_id } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, action: 'removed', message: 'Favorilerden çıkarıldı.' });
    }

    const favorite = await Favorite.create({ user_id, artwork_id });
    res.status(201).json({ success: true, action: 'added', message: 'Favorilere eklendi.', data: favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Kullanıcının favorilerini getir ────────────
const getUserFavorites = async (req, res) => {
  try {
    const { user_id } = req.query;
    const favorites = await Favorite.findAll({
      where: { user_id: user_id || 1 },
      include: [{ model: Artwork, as: 'artwork' }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Favori kontrolü (Tek eser) ────────────────
const checkFavorite = async (req, res) => {
  try {
    const { user_id, artwork_id } = req.query;
    const existing = await Favorite.findOne({ where: { user_id, artwork_id } });
    res.json({ success: true, isFavorite: !!existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Favoriden çıkar ───────────────────────────
const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const favorite = await Favorite.findByPk(id);
    if (!favorite) return res.status(404).json({ success: false, message: 'Favori bulunamadı.' });

    await favorite.destroy();
    res.json({ success: true, message: 'Favoriden çıkarıldı.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  toggleFavorite,
  getUserFavorites,
  checkFavorite,
  removeFavorite
};
