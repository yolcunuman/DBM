// ═══════════════════════════════════════════════
//  Workshop & Reservation Routes
//  Geliştirici 2
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/workshopController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── Seed ───────────────────────────────────────
router.post('/workshops/seed', seedWorkshops);

// ─── Kategoriler ────────────────────────────────
router.get('/workshops/categories', getWorkshopCategories);

// ─── Atölye Endpoint'leri ───────────────────────
router.get('/workshops', getAllWorkshops);
router.get('/workshops/:id', getWorkshopById);
router.post('/workshops', protect, adminOnly, createWorkshop);
router.put('/workshops/:id', protect, adminOnly, updateWorkshop);
router.delete('/workshops/:id', protect, adminOnly, deleteWorkshop);

// ─── Rezervasyon Endpoint'leri ──────────────────
router.post('/reservations', protect, createReservation);
router.get('/reservations', protect, getReservations);
router.put('/reservations/:id', protect, updateReservation);
router.delete('/reservations/:id', protect, cancelReservation);

module.exports = router;
