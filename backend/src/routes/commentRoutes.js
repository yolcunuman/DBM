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

router.get('/comments', getComments);
router.post('/comments', createComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);
router.post('/comments/:id/helpful', markHelpful);
router.put('/comments/:id/reply', adminReply);

module.exports = router;
