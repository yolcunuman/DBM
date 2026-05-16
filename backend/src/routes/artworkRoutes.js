// ═══════════════════════════════════════════════
//  Artwork Routes
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { seedArtworks, getAllArtworks, getArtworkById, getCategories } = require('../controllers/artworkController');

// Seed: Veritabanına 10 eser ekle
router.post('/artworks/seed', seedArtworks);

// Kategorileri getir
router.get('/artworks/categories', getCategories);

// Tüm eserleri listele (filtreleme destekli)
router.get('/artworks', getAllArtworks);

// Tek eser detayı
router.get('/artworks/:id', getArtworkById);

module.exports = router;
