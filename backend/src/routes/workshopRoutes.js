// ═══════════════════════════════════════════════
//  Workshop & Reservation Routes
//  Geliştirici 2
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  getAllWorkshops,
  getWorkshopById,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  createReservation,
  getReservations,
  updateReservation,
  cancelReservation,
} = require('../controllers/workshopController');

// ─── Atölye Endpoint'leri ───────────────────────
router.get('/workshops', getAllWorkshops);
router.get('/workshops/:id', getWorkshopById);
router.post('/workshops', createWorkshop);
router.put('/workshops/:id', updateWorkshop);
router.delete('/workshops/:id', deleteWorkshop);

// ─── Rezervasyon Endpoint'leri ──────────────────
router.post('/reservations', createReservation);
router.get('/reservations', getReservations);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', cancelReservation);

module.exports = router;
