// ═══════════════════════════════════════════════
//  Support Ticket Routes
//  Geliştirici 2
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
} = require('../controllers/supportController');

router.post('/support-tickets', createTicket);
router.get('/support-tickets', getTickets);
router.get('/support-tickets/:id', getTicketById);
router.put('/support-tickets/:id', updateTicket);

module.exports = router;
