// ═══════════════════════════════════════════════
//  Artwork Routes
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { seedArtworks, getAllArtworks, getArtworkById, getCategories, createArtwork, getUniqueArtists } = require('../controllers/artworkController');
const { protect, artistOrAdmin } = require('../middleware/authMiddleware');

// Seed: Veritabanına 10 eser ekle
router.post('/artworks/seed', seedArtworks);

// Kategorileri getir
router.get('/artworks/categories', getCategories);

// Sanatçıları listele
router.get('/artworks/artists', getUniqueArtists);

// Tüm eserleri listele (filtreleme destekli)
router.get('/artworks', getAllArtworks);

// Tek eser detayı
router.get('/artworks/:id', getArtworkById);

// Eser Ekle (Sanatçı veya Admin)
router.post('/artworks', protect, artistOrAdmin, createArtwork);

module.exports = router;
