// ═══════════════════════════════════════════════
//  Favorite Routes
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { toggleFavorite, getUserFavorites, checkFavorite, removeFavorite } = require('../controllers/favoriteController');

// Favoriye ekle/çıkar (toggle)
router.post('/favorites/toggle', toggleFavorite);

// Favori kontrolü
router.get('/favorites/check', checkFavorite);

// Kullanıcının favorileri
router.get('/favorites', getUserFavorites);

// Favoriden çıkar
router.delete('/favorites/:id', removeFavorite);

module.exports = router;
