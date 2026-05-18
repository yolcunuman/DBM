// ═══════════════════════════════════════════════
//  Comment Routes
//  Geliştirici 2
// ═══════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  markHelpful,
  adminReply,
} = require('../controllers/commentController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/comments', getComments);
router.post('/comments', protect, createComment);
router.put('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.post('/comments/:id/helpful', protect, markHelpful);
router.put('/comments/:id/reply', protect, adminOnly, adminReply);

module.exports = router;
